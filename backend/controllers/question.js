import opencage from 'opencage-api-client';

import DB from '../models/index.js';
import CustomError from '../utils/customError.js';

const Question = DB.question;
const Favorite = DB.favorite;

const createQuestion = async (req, res, next) => {
  try {
    const { title, content, location } = req.body;

    if (!location) {
      throw new Error('validation failed: Question location is required');
    }

    const data = await opencage.geocode({ q: location });
    const place = data.results[0];

    const question = await Question.create({
      title,
      content,
      location: {
        type: 'Point',
        coordinates: [place.geometry.lng, place.geometry.lat],
      },
      locationName: location,
      author: req.userId
    });

    res.status(201).send({
      success: true,
      data: {
        question,
        message: 'Question added'
      },
      error: null
    });
  } catch (err) {
    next(new CustomError(err.message));
  }
};

const getQuestions = async (req, res, next) => {
  try {
    const data = await opencage.geocode({ q: req.params.location });
    const place = data.results[0];

    const questions = await Question.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [place.geometry.lng, place.geometry.lat],
          },
        },
      },
    });

    res.status(200).send({
      success: true,
      data: {
        questions: questions.map(question => ({
          id: question.id,
          title: question.title,
          content: question.content,
          location: question.locationName,
          answers: question.answers.length,
          likes: question.likes.length
        }))
      },
      error: null
    });

  } catch (err) {
    next(new CustomError(err.message));
  }
};

const getQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id).populate('author')
      .populate({
        path: 'answers',
        populate: { path: 'author' },
      });

    const data = {
      id: question.id,
      title: question.title,
      content: question.content,
      location: question.locationName,
      author: question.author.email,
      answers: question.answers.map(answer => ({
        id: answer.id,
        content: answer.content,
        author: answer.author.email
      })),
      likes: question.likes.length,
    };

    res.status(200).send({
      success: true,
      data: {
        question: data
      },
      error: null
    });
  } catch (err) {
    next(new CustomError(err.message));
  }
};

const addLike = async (req, res, next) => {
  try {
    const question = await Question.findById(req.body.questionId);

    question.likes.push(req.userId);

    await question.save();

    const favorite = await Favorite.create({
      user: req.userId,
      question: question.id
    });

    res.status(200).send({
      success: true,
      data: {
        question,
        favorite
      },
      error: null
    })

  } catch (err) {
    next(new CustomError(err.message));
  }
};

export { createQuestion, getQuestions, addLike, getQuestion };
