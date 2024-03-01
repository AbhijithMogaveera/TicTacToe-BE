import multer from "multer";
import { ApiRequest } from "../core/Request";
import {v4 as uuidv4} from "uuid"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') 
    },
    filename: function (req:ApiRequest, file, cb) {
      let a = file.originalname.split(".")
      let ext = a[a.length-1];
      cb(null, req.tokenPayload?.user_name+"_pofile_image_"+uuidv4()+"."+ext) 
    }
  })

export const upload = multer({ storage: storage });
