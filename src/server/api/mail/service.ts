import * as SibApiV3Sdk from '@sendinblue/client'

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.SENDINBLUE_API_KEY as string)

interface IMail {
  restaurant: string;
  email: string;
  firstname: string;
  subject: string;
  body: string;
  mailId: string;
  rateURL?: string;
  logoURL?: string;
}

const sendEmail = ({ restaurant, email, firstname, subject, body, mailId, logoURL }: IMail): Promise<unknown> => {
  const sendSmtpEmail = {
    to: [
      {
        email,
        firstname,
      },
    ],
    subject,
    templateId: Number(5),
    params: {
      firstname,
      body,
      mailId,
      subject,
      restaurant,
      logoURL,
      unsubscribeURL: new URL(process.env.NEXTAUTH_URL as string).origin + `/api/mail/${mailId}/unsubscribe`,
      rateURL1: new URL(process.env.NEXTAUTH_URL as string).origin + `/api/mail/${mailId}/1`,
      rateURL2: new URL(process.env.NEXTAUTH_URL as string).origin + `/api/mail/${mailId}/2`,
      rateURL3: new URL(process.env.NEXTAUTH_URL as string).origin + `/api/mail/${mailId}/3`,
      rateURL4: new URL(process.env.NEXTAUTH_URL as string).origin + `/api/mail/${mailId}/4`,
      rateURL5: new URL(process.env.NEXTAUTH_URL as string).origin + `/api/mail/${mailId}/5`,
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
