# Challenge Semestre 2 - WebApp

# Setup

##### Install dependencies

```bash
yarn
```

##### Create .env file

```bash
cp .env.example .env
```

##### Start databases

```bash
docker-compose up -d
```

##### Init prisma

```bash
yarn prisma init
yarn prisma generate
yarn prisma db push
```

##### Run dev

```bash
yarn dev
```

# Docker build

```bash
docker build -t webapp --build-arg NEXT_PUBLIC_CLIENTVAR=clientvar --build-arg SKIP_ENV_VALIDATION=true --build-arg NEXTAUTH_URL=http://localhost:3000 --build-arg NEXTAUTH_SECRET=one-piece .
```
