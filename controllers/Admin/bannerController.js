const { error } = require("console");
const Banner = require("../../models/Admin/bannerModel");
const fs = require("fs");

// Public : get all banners
const getAllBanner = async (req, res) => {
  try {
    const getAllBanners = await Banner.find({});
    if(getAllBanners){
    return  res.status(200).json({ success: true, banners: getAllBanners });
    }
    else{
      return res.status(400).json({error})
    }
  } catch (error) {
    console.log("getallbanners error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
};

// Create new banner
const createBanner = async (req, res) => {
  try {
    const {bannerTitle,bannerDesc}=req.body;
    let bannerImg;
   if (req.files && req.files.length > 0) {
                req.files.forEach((file) => {
                  if (file.fieldname === "bannerImg") {
                    bannerImg = file.filename;
                  }
                });
              }

    // Create banner with just the image filename
    const banner = await Banner.create({
      bannerImg,bannerTitle,bannerDesc
    });
if(banner){
   return res.status(200).json({success:"Banner Added"})
}
else {
  return res.status(200).json({error:"something went wrong"})
}
  } catch (error) {
    return res.status(500).json({error:"API Error"})
  }
};

// Update banner
const updateBanner = async (req, res) => {
  try {
    const { id ,bannerTitle,bannerDesc} = req.params;
     let bannerImg;
   if (req.files && req.files.length > 0) {
                req.files.forEach((file) => {
                  if (file.fieldname === "bannerImg") {
                    bannerImg = file.filename;
                  }
                });
              }
 const updatebanner = await Banner.findByIdAndUpdate(
    {_id:id},
    {$set:{bannerImg,bannerTitle,bannerDesc}},
    {new:true}
  )
   if(updatebanner){
    return res.status(200).json({success:"Banner updated"})
   }
   else{
    return res.status(400).json({error:"something went wrong"})
   }
  } catch (error) {
    console.error("updateBanner error:", error);
    return res.status(500).json({error:"API Error"})
  }
};

// Delete banner
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const deletebanner = await Banner.deleteOne({_id:id});
        if (deletebanner) {
        return res.status(200).json({ success:"Banner Deleted Successfully" });
      } else {
        return res.status(400).json({ error: "Something went wrong" });
      }
  } catch (error) {
      return res.status(500).json({ error: "API Error" });
  }
};

module.exports = {
  getAllBanner,
  createBanner,
  updateBanner,
  deleteBanner,
};
