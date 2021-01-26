const Sauces = require('../models/sauces')
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauces({ //un nouvel objet sauce est crée avec le model sauce
    ...sauceObject,
    imageUrl:  `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  }); // l'url de l'image enregistrée dans le dossier images du serveur est aussi stockée dans la base de données
  sauce.save() //la sauce est sauvegardée dans la base de données
    .then(() => {
      return res.status(201).json({ message: 'Objet enregistré !'})
    } )
    .catch(error => {
      return res.status(400).json({ error })
    });
}

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? // on vérifie si la modification concerne le body ou un nouveau fichier image
  { 
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  Sauces.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauces.findOne({ _id: req.params.id }) // on identifie la sauce
    .then( sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];  // on récupère l'adresse de l'image
      fs.unlink(`images/${filename}`, () => { // on la supprime du serveur
        Sauces.deleteOne({ _id: req.params.id }) // on supprime la sauce de la bdd
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => { // on récupère une seule sauce
  Sauces.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

exports.getAllSauce = (req, res, next) => { // on récupère toutes les sauces
  Sauces.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  switch (req.body.like) {
    //option annulation du j'aime ou / j'aime pas
    // cancel = 0
    //check if the user had liked or disliked the sauce
    //uptade the sauce, send message/error
    case 0:
      Sauces.findOne({ _id: req.params.id })
        .then((sauce) => {
          if (sauce.usersLiked.find(user => user === req.body.userId)) {
            Sauces.updateOne({ _id: req.params.id }, {
              $inc: { likes: -1 },
              $pull: { usersLiked: req.body.userId },
              _id: req.params.id
            })
              .then(() => { res.status(201).json({ message: 'Ton avis a été pris en compte!' }); })
              .catch((error) => { res.status(400).json({ error: error }); });

          } if (sauce.usersDisliked.find(user => user === req.body.userId)) {
            Sauces.updateOne({ _id: req.params.id }, {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: req.body.userId },
              _id: req.params.id
            })
              .then(() => { res.status(201).json({ message: 'ok...' }); })
              .catch((error) => { res.status(400).json({ error: error }); });
          }
        })
        .catch((error) => { res.status(404).json({ error: error }); });
      break;
    //likes = 1
    //uptade the sauce, send message/error
    case 1: // option like
      Sauces.updateOne({ _id: req.params.id }, {
        $inc: { likes: 1 },
        $push: { usersLiked: req.body.userId },
        _id: req.params.id
      })
        .then(() => { res.status(201).json({ message: 'Like added!' }); })
        .catch((error) => { res.status(400).json({ error: error }); });
      break;
    //likes = -1
    //uptade the sauce, send message/error
    case -1: // option dislike
      Sauces.updateOne({ _id: req.params.id }, {
        $inc: { dislikes: 1 },
        $push: { usersDisliked: req.body.userId },
        _id: req.params.id
      })
        .then(() => { res.status(201).json({ message: 'Ok... it\'\s your right...' }) })
        .catch((error) => { res.status(400).json({ error: error }) });
      break;
    default:
      console.error('Bad request')
  }
};