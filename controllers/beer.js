
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
      // "comments.owner",
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

// Delete

router.delete('/:beerId', async (req, res) => {
  try {
    const beerToDelete = await Beer.findById(req.params.beerId);
    if (!beerToDelete) {
      res.status(404);
      throw new Error("Could not find beer to delete");
    }
    if (!beerToDelete.owner.equals(req.user._id)) {
      res.status(403);
      throw new Error("You are not authorized to delete this beer");
    }

    await beerToDelete.deleteOne();

    res.status(200).json(beerToDelete);
  } catch (error) {
    const { statusCode } = res;
    res
      .status([403, 404].includes(statusCode) ? statusCode : 500)
      .json({ err: error.message });
  }
});

// Update

router.put('/:beerId', async (req, res) => {
  try {
    const foundBeer = await Beer.findById(req.params.beerId);
    if (!foundBeer.owner.equals(req.user._id)) {
      res.status(403);
      throw new Error(`You can only edit beers you own`);
    }

    if (!CATEGORIES.includes(req.body.category)) {
      throw new Error(
        `${req.body.category} is not a valid category. Please provide one of: ${CATEGORIES.join(", ")}`,
      );
    }

    // if (!req.body.text.trim() || !req.body.title.trim()) {
    //   throw new Error(`The body and title fields must have valid text`);
    // }

    const updatedBeer = await Beer.findByIdAndUpdate(
      req.params.beerId,
      req.body,
      { new: true },
    );

    if (!updatedBeer) {
      throw new Error("Failed to updated beer. Please try again");
    }

    updatedBeer._doc.owner = req.user;

    res.status(200).json(updatedBeer);
  } catch (error) {
    if (res.statusCode === 403) {
      res.json({ err: error.message });
    } else {
      res.status(500).json({ err: error.message });
    }
  }
});

module.exports = router;