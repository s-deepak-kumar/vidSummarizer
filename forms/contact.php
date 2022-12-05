<?php

//Import PHPMailer classes into the global namespace
//These must be at the top of your script, not inside a function
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

//Load Composer's autoloader
require '../vendor/autoload.php';

//Create an instance; passing `true` enables exceptions
$mail = new PHPMailer(true);



try {
  //Server settings
  $mail->SMTPDebug = SMTP::DEBUG_SERVER;                      //Enable verbose debug output
  $mail->isSMTP();                                            //Send using SMTP
  $mail->Host       = 'smtp.gmail.com';                     //Set the SMTP server to send through
  $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
  $mail->Username   = 'yaduvanshivasudev@gmail.com';                     //SMTP username
  $mail->Password   = '#$TRVYGYiubyuhyhu$%%^Y51653465GTVTHFCVGHVHTFCVry5e56yyvghfbhgfv';                               //SMTP password
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            //Enable implicit TLS encryption
  $mail->Port       = 465;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

  //Recipients
  $mail->setFrom('yaduvanshivasudev@gmail.com', 'Sunarant Support');
  $mail->addAddress('dipkfilms@gmail.com', 'Deepak Kumar');     //Add a recipient
  //$mail->addAddress('ellen@example.com');               //Name is optional
  /*$mail->addReplyTo('info@example.com', 'Information');
  $mail->addCC('cc@example.com');
  $mail->addBCC('bcc@example.com');*/

  //Attachments
  //$mail->addAttachment('/var/tmp/file.tar.gz');         //Add attachments
  //$mail->addAttachment('/tmp/image.jpg', 'new.jpg');    //Optional name

  //Content
  $mail->isHTML(true);                                  //Set email format to HTML
  $mail->Subject = 'Contact Us Data From '.$_POST['fullName'];
  $mail->Body    = '<b>Full Name:</b> '.$_POST['fullName'].
      '<br><b>Email:</b> '.$_POST['email'].
      '<br><b>Query Subject:</b> '.$_POST['subject'].
      '<br><b>Message:</b> '.$_POST['message'];
  $mail->AltBody = 'This is the body in plain text for non-HTML mail clients';

  $mail->send();
  echo 'SUCCESS';
} catch (Exception $e) {
  echo "ERROR. Mailer Error: {$mail->ErrorInfo}";
}