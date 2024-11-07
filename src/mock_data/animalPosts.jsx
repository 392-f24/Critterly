import orangeTabby from './orange-tabby.jpg';
import duck from './duck.jpg';
import pizzaSquirrel from './PizzaSquirrel.jpeg';
import skunk from './skunk.jpg';

export const mockAnimalPosts = [
    {
        id: 1,
        title: 'Friendly Campus Cat',
        description: 'Spotted this orange tabby cat near the library! Super friendly and loves pets.',
        photo: orangeTabby,
        address: '1970 Campus Drive, Evanston, IL 60208', // University Library
        date: new Date().toISOString()
    },
    {
        id: 2,
        title: 'Duck Family',
        description: 'A mother duck with ducklings near the rocks! So cute!',
        photo: duck,
        address: '1970 Campus Drive, Evanston, IL 60208', // Lakefill area
        date: new Date().toISOString()
    },
    {
        id: 3,
        title: 'Squirrel with Pizza',
        description: 'This ambitious squirrel is trying to carry an entire slice of pizza up a tree 😂',
        photo: pizzaSquirrel,
        address: '633 Clark St, Evanston, IL 60208', // The Rock area
        date: new Date().toISOString()
    },
    {
        id: 4,
        title: 'Stinky Skunk',
        description: 'A stinky skunk lurking around Kellogg. Be careful!',
        photo: skunk,
        address: '2211 N Campus Drive, Evanston, IL 60208', // Lakefill area
        date: new Date().toISOString()
    },
];