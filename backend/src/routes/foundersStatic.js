const express = require('express');
const router = express.Router();

// Static founder data
const founders = [
  {
    imageUrl: "https://i.postimg.cc/YqmhdM6w/Chat-GPT-Image-May-28-2025-05-55-11-PM.png",
    linkedInUrl: "https://linkedin.com/in/khalilzouari",
    name: "Khalil Zouari",
    role: "Co-Founder & Co-CEO",
    description: "Rami, a veteran in Tunisia's real estate industry with 18+ years experience, has been affiliated with The First Group and Damac Properties.",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Damac_Properties_Logo.png"
  }
];

router.get('/', (req, res) => {
  res.json(founders);
});

module.exports = router; 