import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { CreatePatientDto } from 'src/patients/dto/create-patient.dto';
import { UpdatePatientDto } from 'src/patients/dto/update-patient.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Neo4jService } from '@/neo4j/neo4j.service';
import { v4 as uuidv4 } from 'uuid';
import { Doctor } from '@/lib/types/doctor/doctor';
import { Account } from '@/lib/types/account/account';
import { Patient } from '@/lib/types/patient/patient';

@Injectable()
export class DoctorsService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async createDoctor(
    createDoctorDto: CreateDoctorDto,
  ): Promise<{ doctor: Doctor; account: Account }> {
    const { email, password, ...rest } = createDoctorDto;

    const existingAccount = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (account:Account { email: $email })
        RETURN account
        `,
        { email },
      )
      .run();

    if (existingAccount.length) {
      throw new HttpException('Email already exists', 409);
    }

    const id = uuidv4();
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        CREATE (doctor:Doctor { id: $id, firstName: $doctorProps.firstName, lastName: $doctorProps.lastName, speciality: $doctorProps.speciality, hospital: $doctorProps.hospital, gender: $doctorProps.gender, image: $doctorProps.image, phoneNumber: $doctorProps.phoneNumber , medicalLicenseNumber: $doctorProps.medicalLicenseNumber , address: $doctorProps.address}) 
        -[:HAS_ACCOUNT]-> (account:Account { id: $id, email: $email, password: $password, isBlocked: true, role: 'DOCTOR' })
        RETURN doctor, account
        `,
        {
          id,
          doctorProps: rest,
          email,
          password: hashedPassword,
        },
      )
      .run();

    return {
      doctor: {
        ...result[0].doctor.properties,
      },
      account: {
        ...result[0].account.properties,
      },
    };
  }

  async findOneDoctorById(
    id: string,
  ): Promise<{ doctor: Doctor; account: Account }> {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (doctor:Doctor)-[:HAS_ACCOUNT]->(account:Account)
        WHERE doctor.id = $id
        RETURN doctor, account
        `,
        { id },
      )
      .run();

    if (!result.length) {
      throw new NotFoundException(`Doctor #${id} not found`);
    }

    return {
      doctor: {
        ...result[0].doctor.properties,
      },
      account: {
        ...result[0].account.properties,
      },
    };
  }

  async updateDoctorPassword(
    doctorId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ doctor: Doctor; account: Account }> {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (doctor:Doctor)-[:HAS_ACCOUNT]->(account:Account)
        WHERE doctor.id = $doctorId
        RETURN account
        `,
        { doctorId },
      )
      .run();

    if (!result.length) {
      throw new NotFoundException(`Doctor #${doctorId} not found`);
    }

    const account = result[0].account.properties;

    const isPasswordMatch = await bcrypt.compare(
      changePasswordDto.oldPassword,
      account.password,
    );
    if (!isPasswordMatch) {
      throw new HttpException('Old password is incorrect', 400);
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (account:Account)
        WHERE account.id = $accountId
        SET account.password = $hashedPassword
        RETURN account
        `,
        { accountId: account.id, hashedPassword },
      )
      .run();

    const finalResult = await this.neo4jService
      .initQuery()
      .raw(
        `
      MATCH (doctor:Doctor)-[:HAS_ACCOUNT]->(account:Account)
      WHERE doctor.id = $doctorId
      RETURN account
      `,
        { doctorId },
      )
      .run();

    return {
      doctor: {
        ...finalResult[0].doctor.properties,
      },
      account: {
        ...finalResult[0].account.properties,
      },
    };
  }

  async findDoctorByEmail(
    email: string,
  ): Promise<{ doctor: Doctor; account: Account }> {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (doctor:Doctor)-[:HAS_ACCOUNT]->(account:Account)
        WHERE account.email = $email
        RETURN doctor, account
        `,
        { email },
      )
      .run();

    if (!result.length) {
      throw new NotFoundException(`Doctor with email ${email} not found`);
    }

    return {
      doctor: {
        ...result[0].doctor.properties,
      },
      account: {
        ...result[0].account.properties,
      },
    };
  }

  async updateDoctorById(
    id: string,
    updateDoctorDto: UpdateDoctorDto,
  ): Promise<{ doctor: Doctor; account: Account }> {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (doctor:Doctor)-[:HAS_ACCOUNT]->(account:Account)
        WHERE doctor.id = $id
        RETURN doctor, account
        `,
        { id },
      )
      .run();

    if (!result.length) {
      throw new NotFoundException(`Doctor #${id} not found`);
    }

    const { password, email, ...rest } = updateDoctorDto;

    const updatedDoctor = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (doctor:Doctor)
        WHERE doctor.id = $id
        SET doctor += $rest
        RETURN doctor
        `,
        { id, rest },
      )
      .run();

    return {
      doctor: {
        ...updatedDoctor[0].doctor.properties,
      },
      account: {
        ...result[0].account.properties,
      },
    };
  }

  async removeDoctorById(
    id: string,
  ): Promise<{ doctor: Doctor; account: Account }> {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (doctor:Doctor)-[:HAS_ACCOUNT]->(account:Account)
        WHERE doctor.id = $id
        RETURN doctor, account
        `,
        { id },
      )
      .run();

    if (!result.length) {
      throw new NotFoundException(`Doctor #${id} not found`);
    }

    const accountData = {
      email: result[0].account.properties.email,
      role: result[0].account.properties.role,
      isBlocked: result[0].account.properties.isBlocked,
    };

    const finalResult = await this.neo4jService
      .initQuery()
      .raw(
        `
      MATCH (doctor:Doctor)-[:HAS_ACCOUNT]->(account:Account)
      WHERE doctor.id = $doctorId
      RETURN account
      `,
        { id },
      )
      .run();

    await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (doctor:Doctor)-[:HAS_ACCOUNT]->(account:Account)
        WHERE doctor.id = $id
        DETACH DELETE doctor, account
        `,
        { id },
      )
      .run();

    return {
      doctor: {
        ...finalResult[0].doctor.properties,
      },
      account: {
        ...finalResult[0].account.properties,
      },
    };
  }

  async createPatient(
    createPatientDto: CreatePatientDto,
    doctorId: string,
  ): Promise<{ patient: Patient; account: Account }> {
    const { email, password, ...rest } = createPatientDto;

    const existingAccount = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (account:Account { email: $email })
        RETURN account
        `,
        { email },
      )
      .run();

    if (existingAccount.length) {
      throw new HttpException('Email already exists', 409);
    }

    const id = uuidv4();
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (doctor:Doctor) WHERE doctor.id = $doctorId
        CREATE (patient:Patient { id: $id, firstName: $patientProps.firstName, lastName: $patientProps.lastName, dateOfBirth: $patientProps.dateOfBirth, phoneNumber: $patientProps.phoneNumber, gender: $patientProps.gender, postalCode: $patientProps.postalCode, healthStatus: $patientProps.healthStatus, medicalHistory: $patientProps.medicalHistory })
        -[:HAS_ACCOUNT]-> (account:Account { id: $id, email: $email, password: $password, isBlocked: false, role: 'PATIENT' })
        CREATE (doctor)-[:HAS_PATIENT]->(patient)
        RETURN patient, account
        `,
        {
          doctorId,
          id,
          patientProps: rest,
          email,
          password: hashedPassword,
        },
      )
      .run();

    return {
      patient: {
        ...result[0].patient.properties,
      },
      account: {
        ...result[0].account.properties,
      },
    };
  }

  async findAllPatientsOfDoctor(
    doctorId: string,
  ): Promise<{ patient: Patient; account: Account }[]> {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (doctor:Doctor)-[:HAS_PATIENT]->(patient:Patient)-[:HAS_ACCOUNT]->(account:Account)
        WHERE doctor.id = $doctorId
        RETURN patient, account
        `,
        { doctorId },
      )
      .run();

    if (!result.length) {
      return [];
    }

    return result.map((record) => ({
      patient: {
        ...record.patient.properties,
      },
      account: {
        ...record.account.properties,
      },
    }));
  }

  async findOnePatientOfDoctor(
    patientId: string,
    doctorId: string,
  ): Promise<{ patient: Patient; account: Account }> {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (doctor:Doctor { id: $doctorId })-[:HAS_PATIENT]->(patient:Patient { id: $patientId })-[:HAS_ACCOUNT]->(account:Account)
        RETURN patient, account
        `,
        { doctorId, patientId },
      )
      .run();

    if (!result.length) {
      throw new NotFoundException(
        `Patient #${patientId} not found or does not belong to doctor #${doctorId}`,
      );
    }

    const record = result[0];

    return {
      patient: {
        ...result[0].patient.properties,
      },
      account: {
        ...result[0].account.properties,
      },
    };
  }

  async updatePatientById(
    patientId: string,
    updatePatientDto: UpdatePatientDto,
    doctorId: string,
  ): Promise<{ patient: Patient; account: Account }> {
    const { password, email, ...rest } = updatePatientDto;

    const existingPatient = await this.findOnePatientOfDoctor(
      patientId,
      doctorId,
    );

    if (!existingPatient) {
      throw new NotFoundException(
        `Patient #${patientId} not found or does not belong to doctor #${doctorId}`,
      );
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.neo4jService
        .initQuery()
        .raw(
          `
          MATCH (patient:Patient { id: $patientId })-[:HAS_ACCOUNT]->(account:Account)
          SET account.password = $hashedPassword
          RETURN account
          `,
          { patientId, hashedPassword },
        )
        .run();
    }

    if (email) {
      const emailExists = await this.neo4jService
        .initQuery()
        .raw(
          `
          MATCH (account:Account { email: $email })
          RETURN account
          `,
          { email },
        )
        .run();

      if (emailExists.length) {
        throw new HttpException('Email already exists', 409);
      }

      await this.neo4jService
        .initQuery()
        .raw(
          `
          MATCH (patient:Patient { id: $patientId })-[:HAS_ACCOUNT]->(account:Account)
          SET account.email = $email
          RETURN account
          `,
          { patientId, email },
        )
        .run();
    }

    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (doctor:Doctor { id: $doctorId })-[:HAS_PATIENT]->(patient:Patient { id: $patientId })-[:HAS_ACCOUNT]->(account:Account)
        SET patient += $patientProps
        RETURN patient, account
        `,
        { patientId, doctorId, patientProps: rest },
      )
      .run();

    if (!result.length) {
      throw new NotFoundException(`Failed to update patient #${patientId}`);
    }

    return {
      patient: {
        ...result[0].patient.properties,
      },
      account: {
        ...result[0].account.properties,
      },
    };
  }

  async removePatientById(
    patientId: string,
    doctorId: string,
  ): Promise<{ doctor: Doctor; account: Account }> {
    const patient = await this.findOnePatientOfDoctor(patientId, doctorId);

    if (!patient) {
      throw new NotFoundException(
        `Patient #${patientId} not found or does not belong to doctor #${doctorId}`,
      );
    }

    const finalResult = await this.neo4jService
      .initQuery()
      .raw(
        `
      MATCH (doctor:Doctor { id: $doctorId })-[:HAS_PATIENT]->(patient:Patient { id: $patientId })-[:HAS_ACCOUNT]->(account:Account)
      RETURN account, patient
      `,
        { patientId, doctorId },
      )
      .run();

    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (doctor:Doctor { id: $doctorId })-[:HAS_PATIENT]->(patient:Patient { id: $patientId })-[:HAS_ACCOUNT]->(account:Account)
        DETACH DELETE patient, account
        RETURN patient, account
        `,
        { patientId, doctorId },
      )
      .run();

    if (!result.length) {
      throw new NotFoundException(`Failed to delete patient #${patientId}`);
    }

    return {
      doctor: {
        ...finalResult[0].patient.properties,
      },
      account: {
        ...finalResult[0].account.properties,
      },
    };
  }
}
