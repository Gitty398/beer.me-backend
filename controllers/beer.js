
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

//Create Beer
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

// Show Beer
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

// Delete Beer
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

// Update Beer
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

// Show Location
router.get('/:beerId/location/:locationId',  async (req, res) => {
  try {
    const beer = await Beer.findById(req.params.beerId);
    if (!beer.owner.equals(req.user._id)) {
      res.status(403);
      throw new Error(`You can only edit beers you own`);
    }

    const index = beer.location.findIndex(loc => loc.id === req.params.locationId);
    const loc = beer.location[index];

    res.status(200).json(loc);
  } catch (error) {
    if (res.statusCode === 404) {
      res.json({ err: error.message });
    } else {
      res.status(500).json({ err: error.message });
    }
  }
});

// Create Location
router.post('/:beerId/location/', async (req, res) => {
  try {
    const beer = await Beer.findById(req.params.beerId);
    if (!beer.owner.equals(req.user._id)) {
      res.status(403);
      throw new Error(`You can only edit beers you own`);
    }

    const { name, address, locationImage, beerPrice, beerRating, notes } = req.body;

    if (!name) {
      return res.status(400).send('Location name is required');
    }

    const locations = []; 
    if (name && name.trim().length) { 
      locations.push({
        name: String(name).trim(),
        address: address !== undefined && address !== '' ? String(address).trim() : undefined,
        locationImage: locationImage !== undefined && locationImage !== '' ? String(locationImage).trim() : undefined,
        beerPrice: beerPrice !== undefined && beerPrice !== '' ? Number(beerPrice) : undefined,
        beerRating: beerRating !== undefined && beerRating !== '' ? Number(beerRating) : undefined,
        notes: notes !== undefined && notes !== '' ? String(notes).trim() : undefined,
      });
    }
    
    const banana = beer.location.create({
      name: locations[0].name,
      address: locations[0].address,
      locationImage: locations[0].locationImage,
      beerPrice: locations[0].beerPrice,
      beerRating: locations[0].beerRating,
      notes: locations[0].notes,
    });
  
    beer.location.push(banana);

    await Beer.findByIdAndUpdate(
      req.params.beerId,
      beer,
      { new: true },
    );

    res.status(201).json({ beer });
  } catch (error) {
    console.error('[POST /:beerId/location] Error:', error);
    res.redirect('/');
  }
});

// Delete Location
router.delete('/:beerId/location/:locationId', async (req, res) => {
  try {
    const beer = await Beer.findById(req.params.beerId);
    if (!beer.owner.equals(req.user._id)) {
      res.status(403);
      throw new Error(`You can only edit beers you own`);
    }

    const index = beer.location.findIndex(loc => loc.id === req.params.locationId);

    if (index !== -1) {
      beer.location.splice(index, 1);
    }

    await Beer.findByIdAndUpdate(
      req.params.beerId,
      beer,
      { new: true },
    );

    res.status(200).json(beer);
  } catch (error) {
    console.error('[DELETE /:beerId/location/:locationId] Error:', error);
    res.redirect('/');
  }
});

// Update Location
router.put('/:beerId/location/:locationId', async (req, res) => {
  try {
    const beer = await Beer.findById(req.params.beerId);
    if (!beer.owner.equals(req.user._id)) {
      res.status(403);
      throw new Error(`You can only edit beers you own`);
    }

    const index = beer.location.findIndex(loc => loc.id === req.params.locationId);
    const loc = beer.location[index];
    const { name, address, locationImage, beerPrice, beerRating, notes } = req.body;

    if (!name) {
      return res.status(400).send('Location name is required');
    }
    
    loc.name = String(name).trim();
    if (address) { loc.address = String(address).trim(); } 
    if (locationImage) { loc.locationImage = String(locationImage).trim(); }
    if (beerPrice) { loc.beerPrice = Number(beerPrice); }
    if (beerRating) { loc.beerRating = Number(beerRating); }
    if (notes) { loc.notes = String(notes).trim(); }

    beer.location[index] = loc;

    await Beer.findByIdAndUpdate(
      req.params.beerId,
      beer,
      { new: true },
    );

    res.status(201).json({ beer });
  } catch (error) {
    console.error('[PUT /:workoutId/exercises/:exerciseId] Error:', error);
    res.redirect('/');
  }
});

module.exports = router;