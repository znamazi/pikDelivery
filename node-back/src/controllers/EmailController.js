const nodemailer = require('nodemailer')
// TODO Set from email ,  auth

const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  secure: false,
  auth: {
    user: 'info.pikdelivery@gmail.com', // generated ethereal user
    pass: 'pikdelivery64$' // generated ethereal password
  }
})

const sendWelcomeEmail = async (email) => {
  try {
    var mailOptions = {
      from: 'info.pikdelivery@gmail.com', // sender address
      to: email,
      subject: 'WELCOME to PIK DELIVERY!',
      text: 'Confirm your account and use this app',
      html: ` <div style="background-color: #ecebeb;
                          padding: 30px;
                          margin: 30px;
                          width: 70%;
                          border-radius: 5px;">
                <h1 style=" padding: 15px; text-align: center;">WELCOME to PIK DELIVERY!</h1>
                <h4 style=" padding: 15px; text-align: center;"> You've recieved this email because your email address has been registered with pikdelivery.com </h2>
                <h2 style=" padding: 15px; text-align: center;">We'are exicted to have you get started. Confirm your account and use this app</h3>
                <h4 style=" padding: 15px; text-align: center;">If you have any questions, just reply this email. we are always happy to help out. </h3>
            </div>
       ` // html body
    }

    let info = await transporter.sendMail(mailOptions)
    if (info) {
      console.log(` Email was sent :${info.response}`)
    }
  } catch (error) {
    // console.log(error)
  }
}

const sendOrderEmail = async (email, sender) => {
  try {
    var mailOptions = {
      from: 'info.pikdelivery@gmail.com', // sender address
      to: email,
      subject: 'You have new Order check the app pik-delivery',
      text: 'You have new Order check the app pik-delivery',
      html: ` <div style="background-color: #ecebeb;
                          padding: 30px;
                          margin: 30px;
                          width: 70%;
                          border-radius: 5px;">
                <h1 style=" padding: 15px; text-align: center;">WELCOME to PIK DELIVERY!</h1>
                <h4 style=" padding: 15px; text-align: center;"> You've recieved this email because your email address has been registered with pikdelivery.com and a new order has been registered </h2>
                <h2>${sender} send you a package.</h2>
                <h2 style=" padding: 15px; text-align: center;">Congratulations, you've selected a perfect look!</h3>
                <h4 style=" padding: 15px; text-align: center;">If you have any questions, just reply this email. we are always happy to help out. </h3>
            </div>` // html body
    }

    let info = await transporter.sendMail(mailOptions)
    if (info) {
      console.log(` Email was sent :${info.response}`)
    }
  } catch (error) {
    // console.log(error)
  }
}

const sendResetTokenEmail = async (email, resetUrl) => {
  try {
    var mailOptions = {
      from: 'info.pikdelivery@gmail.com', // sender address
      to: email,
      subject: 'Your password reset token (valid for only 10 minutes)',
      text: `Forgot your password? Submit a PATCH request with your new password to: ${resetUrl}.\nIf you didn't forgot your password, please ignore this email`
    }

    let info = await transporter.sendMail(mailOptions)
    if (info) {
      console.log(` Email was sent :${info.response}`)
    }
  } catch (error) {
    console.log(error)
  }
}

const sendPasswordRecoveryEmail = async (email, code) => {
  try {
    var mailOptions = {
      from: 'info.pikdelivery@gmail.com', // sender address
      to: email,
      subject: 'Password Recovery',
      text: `Forgot your password? This is your recovery code: ${code}.\nIf you didn't forgot your password, please ignore this email`
    }

    let info = await transporter.sendMail(mailOptions)
    if (info) {
      console.log(` Email was sent :${info.response}`)
    }
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

const sendWelcomeUserBusiness = async (email, password) => {
  try {
    var mailOptions = {
      from: 'info.pikdelivery@gmail.com', // sender address
      to: email,
      subject: 'WELCOME to PIK DELIVERY!',

      html: ` <div style="background-color: #ecebeb;
                          padding: 30px;
                          margin: 30px;
                          width: 70%;
                          border-radius: 5px;">
                <h1 style=" padding: 15px; text-align: center;">WELCOME to PIK DELIVERY!</h1>
                <h4 style=" padding: 15px; text-align: center;"> You've recieved this email because your email address has been registered with pikdelivery.com </h2>
                <h2 style=" padding: 15px; text-align: center;">We'are exicted to have you get started. You can use the following information to log in</h3>
                <h3>Username: ${email}</h3>
                <h3>Password: ${password}</h3>
                <h3>Link to login: <a href="https://app.pikdelivery.com">https://app.pikdelivery.com</a></h3>


                <h4 style=" padding: 15px; text-align: center;">If you have any questions, just reply this email. we are always happy to help out. </h3>
            </div>
       ` // html body
    }

    let info = await transporter.sendMail(mailOptions)
    if (info) {
      console.log(` Email was sent :${info.response}`)
    }
  } catch (error) {
    // console.log(error)
  }
}

const sendContactUs = async (
  senderType,
  sender,
  category,
  order,
  details,
  images
) => {
  let attachments = images.map((i) => ({
    filename: i.filename,
    path: i.url,
    cid: i.filename //same cid value as in the html img src
  }))

  try {
    var mailOptions = {
      from: 'info.pikdelivery@gmail.com', // sender address
      // to: 'sadeghte@gmail.com',
      to:
        senderType === 'Customer'
          ? 'clientes@pikdelivery.com'
          : 'partners@pikdelivery.com',
      subject: `Contact Us`,

      html: `
<div style="">
    <h1 style=" padding: 15px; text-align: center;">Contact Us</h1>
    <h3>Sender Type: ${senderType}</h3>
    <h3>Sender Name: ${sender.name}</h3>
    <h3>Sender Email: ${sender.email}</h3>

    ${!!order ? `<h3>Order ID: ${order.id}</h3>` : ''}
    <h3>Category: ${category.category}</h3>
    <h3>Detail:</h3>
    <p>${details}</p>
    ${attachments
      .map(
        (att) => `
      <img style="height: 250px; margin: 1rem" src="cid:${att.cid}" />
    `
      )
      .join('')}
</div>
       `,
      attachments
    }

    let info = await transporter.sendMail(mailOptions)
    if (info) {
      console.log(` Email was sent :${info.response}`)
    }
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

module.exports = {
  sendWelcomeEmail,
  sendOrderEmail,
  sendResetTokenEmail,
  sendPasswordRecoveryEmail,
  sendWelcomeUserBusiness,
  sendContactUs
}
