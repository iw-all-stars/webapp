import * as SibApiV3Sdk from '@sendinblue/client'

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.SENDINBLUE_API_KEY as string)

interface IMail {
  templateId: number;
  restaurant: string;
  email: string;
  firstname: string;
  subject: string;
  body: string;
  mailId: string;
  rateURL?: string;
  logoURL?: string;
}

const sendEmail = ({ templateId, restaurant, email, firstname, subject, body, mailId, rateURL, logoURL }: IMail): Promise<unknown> => {
  const sendSmtpEmail = {
    to: [
      {
        email,
        firstname,
      },
    ],
    subject,
    templateId,
    params: {
      firstname,
      body,
      mailId,
      subject,
      restaurant,
      rateURL,
      logoURL,
    },
  };

  return apiInstance.sendTransacEmail(sendSmtpEmail).then(
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
