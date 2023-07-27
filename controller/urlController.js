require('dotenv').config()
const Url = require('../models/Url');
const shortid = require('shortid');
const User = require('../models/user')
const jwt = require('jsonwebtoken');
const Secret_Key = process.env.Secret_Key



module.exports.UrlAdd = async (req, res) => {
  try {
    const { title, longurl } = req.body;

    if (!title && !longurl) {
      return res.status(404).json({ Message: "Required data error" })
    }
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, Secret_Key);
    const user = await User.findById(decodedToken.userId)
    const ShortId = shortid.generate();

    const shorturl = `https://url-short-be.onrender.com/shorturl/` + ShortId;

    const newUrl = new Url({
      title,
      longurl,
      shorturl,
      shortid: ShortId,
      user: user._id
    })
    await newUrl.save();

    return res.status(201).json({ Message: " Url Shortening completed successfully" })
  }
  catch (error) {
    return res.status(500).json({ Message: "Internal server error" })
  }
}

module.exports.Click = async (req, res) => {
  try {
    const { shorturl } = req.body;
    const url = await Url.findOne({ shorturl });
    url.clicks = url.clicks + 1;
    await Url.findByIdAndUpdate(url._id, url);
    return res.status(201).json({ Message: "Url click count updated" })
  }
  catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.GetuserData = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, Secret_Key);
    const Currentuser = await User.findById(decodedToken.userId)
    const urlDatas = await Url.find({ user: Currentuser._id });
    if (urlDatas) {
      return res.status(201).json(urlDatas)
    } else {
      return res.status(404).json({ Message: "Data not found/Short url not created yet" })
    }

  }
  catch (err) {
    return res.status(500).json({ Message: "Internal server error", err })
  }
}


module.exports.Redirect = async (req, res) => {
  const id = req.params.id;
  try {
    const urlData = await Url.findOne({ shortid: id });
    res.redirect(urlData.longurl);
  } catch (error) {
    console.error(error);
  }
}