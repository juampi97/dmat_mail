import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";

import { generarListadoHtml, generararExcel } from './funciones.js'

const app = express();
app.use(cors());
// app.use(cors({
//   origin: ['127.0.0.1','127.0.0.1:5500','localhost']
// }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

dotenv.config();

const port = process.env.PORT || 8080;

const secret_key = process.env.SECRET_KEY;

app.listen(port, () => {
  console.log(`Corriendo app en puerto ${port}`);
});

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

app.get("/", (req, res) => {
  res.send("Servidor Nodemailer");
});

app.post("/mail", async (req, res) => {
  // console.log(req.body);
  const {
    nombre,
    empresa,
    provincia,
    localidad,
    direccion,
    telefono,
    email,
    codigo,
    producto,
    vendedor,
    Mensaje,
    captcha,
  } = req.body;
  if (!captcha) {
    res
      .status(400)
      .json({ status: "error", mensaje: "Captcha token undefined" });
  }

  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${captcha}`;

  axios({
    url: verifyUrl,
    method: "POST",
  }).then(({ data }) => {
    // console.log(data.success);
    if (data.success) {
      try {
        let result = transport.sendMail({
          from: `"DMAT" <${process.env.APP_USER}>`,
          // to: "juampicalabro97@gmail.com",
          to: "ventas@dmat.com.ar",
          subject: "Solicitud cotización sitio Dmat",
          html: `
        <div>
        <p> <strong>Nombre</strong>: ${nombre}</p>
        <p> <strong>Empresa</strong>: ${empresa}</p>
        <p> <strong>Provincia</strong>: ${provincia}</p>
        <p> <strong>Localidad</strong>: ${localidad}</p>
        <p> <strong>Direccion</strong>: ${direccion}</p>
        <p> <strong>Telefono</strong>: ${telefono}</p>
        <p> <strong>Email</strong>: ${email}</p>
        <p> <strong>Codigo</strong>: ${codigo}</p>
        <p> <strong>Producto</strong>: ${producto}</p>
        <p> <strong>Vendedor</strong>: ${vendedor}</p>
        <p> <strong>Mensaje</strong>: ${Mensaje}</p>
        </div>
        `,
          attachments: [],
        });
        res.status(200).json({ status: "ok", mensaje: "Mensaje Enviado!" });
      } catch (error) {
        res
          .status(400)
          .json({
            status: "error",
            mensaje:
              "Error al enviar el mensaje. Intenta nuevamente mas tarde.",
          });
      }
    } else {
      return res.json({
        status: "error",
        mensaje: "Debes ser un robot",
      });
    }
  });
});

app.post("/pedido", async (req, res) => {
  // console.log(req.body);
  const { nombre, email, empresa, cuit, listado_articulos, captcha } = req.body;
  const html = generarListadoHtml(listado_articulos)
  //  const pathArchivo = generararExcel(listado_articulos)

  if (!captcha) {
    res
      .status(400)
      .json({ status: "error", mensaje: "Captcha token undefined" });
  }

  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${captcha}`;

  axios({
    url: verifyUrl,
    method: "POST",
  }).then(({ data }) => {
    if (data.success) {
      try {
        let result = transport.sendMail({
          from: `"DMAT" <${process.env.APP_USER}>`,
          // to: "juampicalabro97@gmail.com",
          to: "ventas@dmat.com.ar",
          subject: "Solicitud cotización sitio Dmat",
          html: `
        <div>
          <p><strong>Cliente</strong>: ${nombre}</p>
          <p><strong>Email</strong>: ${email}</p>
          <p><strong>Empresa</strong>: ${empresa}</p>
          <p><strong>Cuit</strong>: ${cuit}</p>
          <p>Se solicita la siguiente cotización:</p>
          ${html}
          <br/>
        </div>
        `,
          //  attachments: [{
          //    filename:'',
          //    path:pathArchivo,
          //    cid:''
          //  }],
          attachments: [],
        });
        res.status(200).json({ status: "ok", mensaje: "Solicitud de cotizacion realizada!" });
      } catch (error) {
        res
          .status(400)
          .json({
            status: "error",
            mensaje:
              "Error al completar la solicitud de pedido. Intenta nuevamente mas tarde.",
          });
      }
    } else {
      return res.json({
        status: "error",
        mensaje: "Debes ser un robot",
      });
    }
  });
});
