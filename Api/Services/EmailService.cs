using Api.Dto.Account;
using Mailjet.Client;
using Mailjet.Client.TransactionalEmails;

namespace Api.Services
{
    public class EmailService
    {

        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            this._configuration = configuration;
        }

        public async Task<bool> SendEmailAsync(EmailSendDto emailSend)
        {
            MailjetClient client = new MailjetClient(_configuration["mailJet:apiKey"], _configuration["mailJet:secretKey"]);
            
            var email = new TransactionalEmailBuilder()
                                .WithFrom(new SendContact(_configuration["Email:From"], _configuration["Email:Application"]))
                                .WithSubject(emailSend.Subject)
                                .WithHtmlPart(emailSend.Body)
                                .WithTo(new SendContact(emailSend.To))
                                .Build();

            var response = await client.SendTransactionalEmailAsync(email);

            if (response.Messages != null)
            {
                if (response.Messages[0].Status == "success")
                {
                    return true;
                }
            }
            return false;   
        }
    }
}
