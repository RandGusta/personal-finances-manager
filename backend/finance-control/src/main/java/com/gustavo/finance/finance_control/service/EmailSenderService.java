package com.gustavo.finance.finance_control.service;

import org.hibernate.annotations.Audited;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailSenderService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Autowired
    private TemplateEngine templateEngine;

    public void emailSender(String recipient, String subject, String text){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(text);
        javaMailSender.send(message);
    }
    
    @Async
    public void sendEmailTemplate(String recipient, String subject, 
        String template, Context context){
            String tampleString = templateEngine.process(template, context);
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper messageHelper;
            try{
                messageHelper = new MimeMessageHelper(message, true);
                messageHelper.setTo(recipient);
                messageHelper.setSubject(subject);
                messageHelper.setText(tampleString, true);
            }catch(MessagingException e){
                e.printStackTrace();
            }
            javaMailSender.send(message);
    }
    
}
