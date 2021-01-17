const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const uuid = require('uuid');
const fs = require('fs');
const Place = require('../models/place');
const User = require('../models/user');
const mongoose = require('mongoose');

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find place',
            500
        );
        return next(error);
    }

    if (!place) {
        const error = new HttpError(
            'Could not find a place for the provided id',
            404
        );
        return next(error);
    }
    res.json({ place: place.toObject({ getter: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    let places;
    try {
        places = await Place.find({ creator: userId });
    } catch (err) {
        const error = new HttpError("Can't find any place for given id", 500);
        return next(error);
    }

    if (!places || places.length === 0) {
        const error = new HttpError(
            'Could not find a place for the provided user id',
            404
        );
        return next(error);
    }

    res.json({
        places: places.map((place) => place.toObject({ getters: true }))
    });
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(422);
        return next(
            new HttpError('Invalid data, please check your data.', 422)
        );
    }

    const { title, description, address, creator } = req.body;
    const createdPlace = new Place({
        title,
        description,
        address,
        image: req.file.path,
        creator
    });

    let user;

    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError('Creating place failed,try again', 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError(
            'Could not find user with the provided id',
            404
        );
        return next(error);
    }

    //console.log(user);

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError('Creating place failed.', 500);
        return next(error);
    }

    res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid data, please check your data.', 422)
        );
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find place',
            500
        );
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError('Something went wrong', 500);
        return next(error);
    }

    res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find deleting place.',
            500
        );
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find place', 500);
        return next(error);
    }

    const imagePath = place.image;

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        place.remove({ session: sess });
        place.creator.places.pull(place);
        await place.creator.save({ session: sess });
        await (await sess).commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete place',
            500
        );
        return next(error);
    }

    fs.unlink(imagePath, err => {
        console.log(err);
    });

    res.status(200).json({ message: 'Place deleted.' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
