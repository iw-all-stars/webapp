import * as SibApiV3Sdk from '@sendinblue/client'

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.SENDINBLUE_API_KEY as string)

interface IMail {
  templateId: number;
  email: string;
  name: string;
  subject: string;
  body: string;
  mailId: string;
}

const sendEmail = ({ templateId, email, name, subject, body, mailId }: IMail) => {
  const sendSmtpEmail = {
    to: [
      {
        email,
        name,
      },
    ],
    subject,
    templateId,
    params: {
      name,
      body,
      mailId,
    },
    // headers: {
    //   "X-Mailin-custom":
    //     "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
    // },
  };

  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data: unknown) {
      console.log(`API called successfully. Returned data: ${data}`);
      return data;
    },
    function (error: unknown) {
      console.error(error);
      return error;
    }
  );
};

export default sendEmail;
