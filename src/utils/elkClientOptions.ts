export const elkOptions = !process.env.ELASTICSEARCH_CLOUD_ID ? {
  node: process.env.ELASTICSEARCH_URL ?? "http://localhost:9200",
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME ?? "",
    password: process.env.ELASTICSEARCH_PASSWORD ?? "",
  },
} : {
  cloud: process.env.ELASTICSEARCH_CLOUD_ID ? { id: process.env.ELASTICSEARCH_CLOUD_ID } : undefined,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME ?? "",
    password: process.env.ELASTICSEARCH_PASSWORD ?? "",
  },
};