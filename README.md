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



# ELK

## Create client index
```
curl -X PUT -H 'Content-Type: application/json' http://localhost:9200/clients -u elastic:${ELASTIC_PASSWORD} -d '{
   "mappings": {
     "properties": {
       "email": {
          "type": "text",
          "fields": {
            "keyword": { 
              "type": "keyword"
            }
          }
       },
       "name": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
       },
       "firstname": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword"
            }
          }
       },
       "phone": { "type": "keyword" },
       "image": { "type": "keyword" },
       "address": { "type": "keyword" },
       "city": { "type": "keyword" },
       "unsubscribed": { "type": "keyword" },
       "zip": { "type": "keyword" },
       "Mail": { "type": "keyword" },
       "lastLogin": { "type": "date" },
       "createdAt": { "type": "date" },
       "updatedAt": { "type": "date" }
     }
   }
}'
```

## Search data in client index
```
curl http://localhost:9200/clients/_search -u elastic:${ELASTIC_PASSWORD}
```

## Delete data in client index
```
curl -XPOST 'http://localhost:9200/clients/_delete_by_query' -H 'Content-Type: application/json' -u elastic:${ELASTIC_PASSWORD} -d '{
    "query" : {
        "match_all" : {}
    }
}'
```
.