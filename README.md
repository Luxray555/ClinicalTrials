# Dynamic Web Services for Clinical Trials Collection

## 1. Project Structure

The project consists of three repositories:
- **Frontend Application for Normal Users** (Doctors, Patients, and Investigators)
- **Frontend Application for Admins Only**
- **Backend Application**

## 2. Databases

### 2.1 Neo4j Database

To set up Neo4j:

- Install the Neo4j Desktop application: [Neo4j Desktop Download](https://neo4j.com/download/).
- After creating the database and starting the instance, you should have something like this:

- Click **Open**, and you will be presented with a place to run commands (called **Cypher Queries**). Run the following queries to create the system's admin, 4 data sources, and indexes (each green block is a unit to run):

    #### Clinical Trials Index Creation:

    ```cypher
    CREATE FULLTEXT INDEX clinicalTrials FOR (n:ClinicalTrial) ON EACH [n.summary, n.title]
    ```
  
    #### Condition Index Creation:

    ```cypher
    CREATE FULLTEXT INDEX conditions FOR (n:Condition) ON EACH [n.name]
    ```
  
    #### Create Data Sources with Schedule and Slug:

    ```cypher
    MATCH (n) DETACH DELETE(n);
    MERGE (dataSource1:DataSource { name: "ClinicalTrials.gov public API", type: "API", slug: "clinical-trials-gov" })
    ON CREATE SET dataSource1.id = randomUUID()
    WITH dataSource1
    CREATE (schedule1:Schedule { id: randomUUID(), frequency: "MANUAL", timeOfDay: "not set", dayOfMonth: "not set", dayOfWeek: "not set" })
    CREATE (dataSource1)-[:HAS_SCHEDULE]->(schedule1)
    
    MERGE (dataSource2:DataSource { name: "Unicancer.fr Website", type: "Website Scraper", slug: "unicancer" })
    ON CREATE SET dataSource2.id = randomUUID()
    WITH dataSource2
    CREATE (schedule2:Schedule { id: randomUUID(), frequency: "MANUAL", timeOfDay: "not set", dayOfMonth: "not set", dayOfWeek: "not set" })
    CREATE (dataSource2)-[:HAS_SCHEDULE]->(schedule2)
    
    MERGE (dataSource3:DataSource { name: "Cancer.fr Website", type: "Website Scraper", slug: "cancer-fr" })
    ON CREATE SET dataSource3.id = randomUUID()
    WITH dataSource3
    CREATE (schedule3:Schedule { id: randomUUID(), frequency: "MANUAL", timeOfDay: "not set", dayOfMonth: "not set", dayOfWeek: "not set" })
    CREATE (dataSource3)-[:HAS_SCHEDULE]->(schedule3)
    
    MERGE (dataSource4:DataSource { name: "From Investigator", type: "INVESTIGATOR", slug: "investigator" })
    ON CREATE SET dataSource4.id = randomUUID()
    ```
  
    #### Create Admin:

    ```cypher
    WITH 'admin-123' AS id,
    { firstName: 'admin', lastName: 'lastname', image: 'https://example.com/avatar.jpg' } AS adminProps,
    'admin@gmail.com' AS email,
    '$2a$10$0DQnO1OEnIQ0lvWjd0An8e83w9w0XJc4EgVpQaPq2/vfjp7DMRM9m' AS password
    CREATE (admin:Admin { id: id, firstName: adminProps.firstName, lastName: adminProps.lastName, image: adminProps.image })
    -[:HAS_ACCOUNT]->(account:Account { id: id, email: email, password: password, role: 'ADMIN', isBlocked: false })
    RETURN admin, account
    ```
  
    #### Vector Index Creation:

    ```cypher
    CREATE VECTOR INDEX clinicalTrialsVI IF NOT EXISTS
    FOR (m:ClinicalTrial)
    ON m.embedding
    OPTIONS { indexConfig: { `vector.dimensions`: 768, `vector.similarity_function`: 'cosine' }}
    ```

    You can write those Cypher queries one by one after opening Neo4j Desktop.

### 2.2 PostgreSQL Database
-You need to install PostgreSQL.
-Install pgAdmin for a graphical interface.

## 3. Application 1: Backend (NestJS)

### 3.1 Requirements:
- Node.js installed.
- npm and pnpm package managers.

### 3.2 How to Run the Application:
1. Open the source folder.

2. Install dependencies using npm i.

3. Add a new .env file in the root directory with the correct environment variables (local database URL, port, and password).

4. Before starting the backend server, make sure to run Neo4j Desktop and open the instance. Also, ensure that the .env file is correct, or the server won’t start.

5. To start the server, run in the command line:

```bash
npm run start:dev
```

### 3.3 Authentication:
- All routes are protected and require login.
- Admin credentials created earlier are:
  - Email: admin@gmail.com
  - Password: admin123

You can create other users using the auth/register route (defined in auth.controller.ts). Admins must unblock users using the admins/:userId/unblock route (defined in admin.controller.ts).

## 4. Application 2 & 3: Both Frontends (Next.js)

### 4.1 How to Run the Frontend Applications:
1. Open the source folder.
2. Install dependencies using `npm i`.
3. If prompted, use `--force-legacy` as needed.
4. Add a new `.env` file with the correct variables.
5. Run `npm run dev` to start the server.

### 4.2 Notes:
- The backend runs on port 3000. You must start the backend server before the frontend server, as they both run on port 3000. Alternatively, you can modify the frontend to always run on port 3001.
  
