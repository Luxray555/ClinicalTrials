import { Account } from '@/lib/types/account/account';
import { Neo4jService } from '@/neo4j/neo4j.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AccountsService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async findAccountRefreshTokenById(id: string): Promise<string> {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (account:Account)
        WHERE account.id = $id
        RETURN account.refreshToken AS refreshToken
        `,
        { id },
      )
      .run();

    if (!result.length) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return result[0].refreshToken;
  }

  async updateAccountRefreshTokenById(id: string, refreshToken: string) {
    await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (account:Account)
        WHERE account.id = $id
        SET account.refreshToken = $refreshToken
        `,
        { id, refreshToken },
      )
      .run();
  }

  async findAccountByEmail(email: string): Promise<Account> {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (account:Account)
        WHERE account.email = $email
        RETURN account
        `,
        { email },
      )
      .run();

    if (!result.length) {
      throw new NotFoundException(`Account with email ${email} not found`);
    }

    return result[0].account.properties;
  }

  async findAccountById(id: string): Promise<Account> {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (account:Account)
        WHERE account.id = $id
        RETURN account
        `,
        { id },
      )
      .run();

    if (!result.length) {
      throw new NotFoundException(`Account #${id} not found`);
    }

    return result[0].account.properties;
  }
}
