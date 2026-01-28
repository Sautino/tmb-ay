# Quickstart

1. Clone Repository

```bash
git clone https://github.com/Sautino/tmb-ay.git
```

2. Enter directory

```bash
cd tmb-ay
```

3. Create .env file

```bash
cp .env.example .env # Mac/Linux
copy .env.example .env # Windows
```

4. Start database

```bash
pnpm docker:up
```

5. Install packages

```bash
pnpm install
```

6. Migrate database

```bash
pnpm db:migrate
```

7. Generate prisma types

```bash
pnpm db:generate
```

8. Start project

```bash
pnpm start:dev
```

API is running on [http://localhost:3000](http://localhost:3000)

You can import this [Postman collection](./TMB-AY.postman_collection.json) into Postman
