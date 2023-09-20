require('dotenv').config();

exports.uploadFilePayment = (req, res) => {
    const newpath = __dirname.split('controller')[0] + "/public/files/payment/";
    console.log(newpath)
    const file = req.files.file;
    const filename = file.name;
 
    file.mv(`${newpath}${filename}`, (err) => {
        if (err) {
            res.status(500).send({ message: "File upload failed", code: 200 });
        }
        res.status(200).send({ message: "File Uploaded", code: 200 });
    });
}

exports.uploadFileBook = (req, res) => {
    const newpath = __dirname.split('controller')[0] + "/public/files/books/";
    const file = req.files.file;
    const filename = file.name;
    file.mv(`${newpath}${filename}`, (err) => {
        if (err) {
            res.status(500).send({ message: "File upload failed", code: 200 });
        }
        res.status(200).send({ message: "File Uploaded", code: 200 });
    });
}