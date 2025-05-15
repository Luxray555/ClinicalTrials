import { Patient } from '@/lib/types/data-model';
import { Neo4jService } from '@/neo4j/neo4j.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class PatientsService {
  constructor(private readonly neo4jService: Neo4jService) { }

  async findOnePatientById(patientId: string) {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (patient:Patient { id: $patientId })-[:HAS_ACCOUNT]->(account:Account)
        RETURN patient, account
        `,
        { patientId },
      )
      .run();

    if (!result.length) {
      throw new NotFoundException(`Patient #${patientId} not found`);
    }

    return {
      patient: {
        ...result[0].patient.properties,
      },
      account: {
        id: result[0].account.properties.id,
        email: result[0].account.properties.email,
        role: result[0].account.properties.role,
        isBlocked: result[0].account.properties,
      },
    };
  }

  async findPatientByEmail(email: string) {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (patient:Patient)-[:HAS_ACCOUNT]->(account:Account { email: $email })
        RETURN patient, account
        `,
        { email },
      )
      .run();

    if (!result.length) {
      throw new NotFoundException(`Patient with email ${email} not found`);
    }

    return {
      patient: {
        ...result[0].patient.properties,
      },
      account: {
        id: result[0].account.properties.id,
        email: result[0].account.properties.email,
        role: result[0].account.properties.role,
        isBlocked: result[0].account.properties,
      },
    };
  }

  stringifyPatient(patientInput: {
    patient: Patient;
    account: {
      id: string;
      email: string;
      role: string;
      isBlocked: boolean;
    };
  }): string {
    const patient = patientInput.patient;

    const patientString = `
    ${patient.medicalHistory}
    ${patient.conditions?.map(condition => condition.name).join(', ')}
    ${patient.healthStatus}
 `
    return patientString;
  }
}
