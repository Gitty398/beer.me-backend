
const router = require("express").Router();
const Beer = require("../models/beer");
const User = require ("../models/user")
const CATEGORIES = ['Ale', 'Lager']

// Index

router.get('/', async (req, res) => {
  try {
    const beers = await Beer.find()
      .populate("owner")
      .sort({ createdAt: -1 });

    res.status(200).json(beers);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

//Create

router.post('/',  async (req, res) => {
  try {
    if (!CATEGORIES.includes(req.body.category)) {
      throw new Error(
        `${req.body.category} is not a valid category. Please provide one of: ${CATEGORIES.join(", ")}`,
      );
    }

    // if (!req.body.text.trim() || !req.body.title.trim()) {
    //   throw new Error(`The body and title fields must have valid text`);
    // }

    req.body.owner = req.user._id;
    const beer = await Beer.create(req.body);
    

    beer._doc.owner = req.user;
    await User.findByIdAndUpdate(
      req.body.owner,
      { $push: { beerList: beer._id } },
      { new: true }
    )

    res.status(201).json({ beer });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

// Show

router.get('/:beerId',  async (req, res) => {
  try {
    const beer = await Beer.findById(req.params.beerId).populate([
      "owner",
      "comments.owner",
    ]);
    if (!beer) {
      res.status(404);
      throw new Error(
        "We cannot find this beer, please select another beer from the list",
      );
    }

    res.status(200).json(beer);
  } catch (error) {
    if (res.statusCode === 404) {
      res.json({ err: error.message });
    } else {
      res.status(500).json({ err: error.message });
    }
  }
});







module.exports = router;