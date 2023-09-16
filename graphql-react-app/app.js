const express = require('express');
const bodyParser = require('body-parser');

const { graphqlHTTP } = require("express-graphql");   // It is used as middleware function for parsing the Query of GraphqQL
const { buildSchema } = require('graphql') // this is used to convert the String to GraphQl Schema


const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');


const  Event = require('./models/event');
const  User = require('./models/user');


const app = express();


const events = [];


app.use(bodyParser.json());



//here graphql is endpoint
app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User!
        }

        type User {
            _id: ID!
            email: String!
            password: String
            createdEvents: [Event!]
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }


        type RootQuery {
            events: [Event!]!
        }


        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User

        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `), //Resolver Methods
    rootValue: {
        events: () => {
         return  Event.find()
            .populate('creator')
            .then(events =>{
                return events.map(event =>{
                    return { ...event._doc,_id: event.id};
                })
            })
            .catch(err => {
                console.log(err);
                throw err;
            })
        },
        createEvent: (args) => {
        //   const event = {
        //     _id: Math.random().toString(),
        //     title: args.eventInput.title,
        //     description: args.eventInput.description,
        //     price: +args.eventInput.price,
        //     date: new Date().toISOString()
        //   };
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '63f3aefae20d62b18874b9ed'
        });
        let createdEvent;
          return event
            .save()
            .then(result => { 
                createdEvent =  {...result._doc,_id: result._doc._id.toString()};
                return User.findById('63f3aefae20d62b18874b9ed')
             })
             .then(user => {
                if (!user) {
                    throw new Error("User Not Found");
                }
                user.createdEvents.push(event);
                return user.save();
             })
             .then(result => {
                return createdEvent;
             })
            .catch(err => {
                console.log(err);
                throw err;
            });
    
        },
        createUser: args => {
           return  User.findOne({email: args.userInput.email}).then(user => {
                if (user) {
                    throw new Error("User Exists already")
                }
                return  bcrypt
                .hash(args.userInput.password, 12) //here 12 is slat
            })
            .then(hashedPassword => {
                const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword
                });
                return  user.save()
                .then(result => {
                    return {...result._doc, password:null,_id: result.id };
                })
                .catch(err => {
                    throw err
                })
            })
            .catch(err => {
                throw err;
            })
            
        }
    },//For Debugging only
    graphiql: true 
    
}));




mongoose.connect('mongodb://localhost/playground')
    .then(()=> console.log("Successfully Connected to Database") )
    .catch(err => console.log(err));


app.listen(3000,()=> console.log("Server Started at 3000 Port"))
