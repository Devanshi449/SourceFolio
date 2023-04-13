import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cl from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import session from 'express-session';
import flash from 'connect-flash';
import MongoDBStorePackage from 'connect-mongodb-session';
import portfolioSchema from '../JoiSchemas.js';
import ExpressError from '../ExpressError.js';
import fs from 'fs';
import admin from 'firebase-admin';
if(process.env.NODE_ENV !== 'production') {
    dotenv.config();
}
const credentials = JSON.parse(
    fs.readFileSync('./credentials.json')
);

admin.initializeApp({
    credential: admin.credential.cert(credentials),
});
if(process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const cloudinary = cl.v2;
import { CloudinaryStorage } from 'multer-storage-cloudinary';
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'SourceFolio',
        allowedFormats: ['jpeg', 'jpg', 'png']
    }
})
const upload = multer({storage});
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); 

const secret = 'thisisasecret';

app.use(helmet.crossOriginOpenerPolicy());
app.use(helmet.crossOriginResourcePolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.originAgentCluster());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
const cloudinary_val = process.env.CLOUDINARY_CLOUD_NAME
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${cloudinary_val}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        }
    })
);
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authtoken, file");
    next();
  });

const dbUrl = 'mongodb://localhost:27017/source-folio';
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("connection open");
});

function convertJSON(inputJSON) {
    
    const outputJSON = {
        "user_id": "",
    	"name": "",
    
    	"mainDesignations": [],
    
    	"description": "",
    	
    
    	"myEducation": [],
    
    	"myExperience": [],
    
    	"myProjects": [],
    
    	"mySkills": {
    		"programmingSkills": [],
    		"toolsAndFrameworks": []
    	},
    
    	"myAchievements": [],
    	"linkedIn": "",
    	"instagram": "",
    	"telephone": "",
    	"email": ""
    };
    
    outputJSON['name'] = inputJSON['name'];
    if(typeof(inputJSON['mainDesignations']) == 'object') outputJSON['mainDesignations'] = inputJSON['mainDesignations'];
    else outputJSON['mainDesignations'].push(inputJSON['mainDesignations']);
    outputJSON['description'] = inputJSON['description'];
    if(inputJSON['profilePicture']) outputJSON['profilePicture'] = {url: inputJSON['profilePicture'].path, filename: inputJSON['profilePicture'].filename};
    outputJSON['linkedIn'] = inputJSON['linkedIn'];
    outputJSON['instagram'] = inputJSON['instagram'];
    outputJSON['telephone'] = inputJSON['telephone'];
    outputJSON['email'] = inputJSON['email'];
    if(typeof(inputJSON['myAchievements']) == 'object') outputJSON['myAchievements'] = inputJSON['myAchievements'];
    else outputJSON['myAchievements'].push(inputJSON['myAchievements']);

    if(typeof(inputJSON['institutionName']) == 'object') {
        for(let i = 0; i < inputJSON['institutionName'].length; i++) {
            const obj = {
                "institutionName": "",
                "place": "",
                "year": 0,
                "aggregate": 0,
                "coursePursuied": ""
            };
            obj['institutionName'] = inputJSON['institutionName'][i];
            obj['place'] = inputJSON['place'][i];
            obj['year'] = Number(inputJSON['year'][i]);
            obj['aggregate'] = Number(inputJSON['aggregate'][i]);
            obj['coursePursuied'] = inputJSON['coursePursuied'][i];
            
            outputJSON['myEducation'].push(obj);
        }
    } else {
        const obj = {
            "institutionName": "",
            "place": "",
            "year": 0,
            "aggregate": 0,
            "coursePursuied": ""
        };
        obj['institutionName'] = inputJSON['institutionName'];
        obj['place'] = inputJSON['place'];
        obj['year'] = Number(inputJSON['year']);
        obj['aggregate'] = Number(inputJSON['aggregate']);
        obj['coursePursuied'] = inputJSON['coursePursuied'];
        outputJSON['myEducation'].push(obj);
    }
    
    if(typeof(inputJSON['role']) == 'object') {
        for(let i = 0; i < inputJSON['role'].length; i++) {
            const obj = {
                "role": "",
                "duration": {
                    "start": "",
                    "end": ""
                },
                "company": "",
                "workDescription": [],
                "certificate": ""
            };
            
            obj["role"] = inputJSON["role"][i];
            obj["company"] = inputJSON["company"][i];
            obj["certificate"] = inputJSON["certificate"][i];
            obj["duration"]["start"] = inputJSON["start"][i];
            obj["duration"]["end"] = inputJSON["end"][i];
            if(typeof(inputJSON['workDescription_'+i]) == 'object') obj["workDescription"] = inputJSON["workDescription_" + i];
            else obj['workDescription'].push(inputJSON['workDescription_'+i]);
            outputJSON["myExperience"].push(obj);
        }
    } else {
        const obj = {
            "role": "",
            "duration": {
                "start": "",
                "end": ""
            },
            "company": "",
            "workDescription": [],
            "certificate": ""
        };

        obj["role"] = inputJSON["role"];
        obj["company"] = inputJSON["company"];
        obj["certificate"] = inputJSON["certificate"];
        obj["duration"]["start"] = inputJSON["start"];
        obj["duration"]["end"] = inputJSON["end"];
        if(typeof(inputJSON['workDescription_0']) == 'object') obj["workDescription"] = inputJSON["workDescription_0"];
        else obj['workDescription'].push(inputJSON['workDescription_0']);
        outputJSON["myExperience"].push(obj);
    }
    
    if(typeof(inputJSON['projectName']) == 'object') {
        for(let i = 0; i < inputJSON['projectName'].length; i++) {
            const obj = {
                "projectName": "",
                "description": [],
                "gitHubLink": "",
                "projectLink": "",
            };
            
            obj["projectName"] = inputJSON["projectName"][i];
            if(typeof(inputJSON['projectDescription_' + i]) == 'object') obj["description"] = inputJSON["projectDescription_" + i];
        else obj['description'].push(inputJSON['projectDescription_' + i]);
            obj["gitHubLink"] = inputJSON["gitHubLink"][i];
            obj["projectLink"] = inputJSON["projectLink"][i];
            
            outputJSON["myProjects"].push(obj);
        }
    } else {
        const obj = {
            "projectName": "",
            "description": [],
            "gitHubLink": "",
            "projectLink": "",
        };

        obj["projectName"] = inputJSON["projectName"];
        if(typeof(inputJSON['projectDescription_0']) == 'object') obj["description"] = inputJSON["projectDescription_0"];
        else obj['description'].push(inputJSON['projectDescription_0']);
        obj["gitHubLink"] = inputJSON["gitHubLink"];
        obj["projectLink"] = inputJSON["projectLink"];
        
        outputJSON["myProjects"].push(obj);
    }
    
    if(typeof(inputJSON['skillName']) == 'object') {
        for(let i = 0; i < inputJSON['skillName'].length; i++) {
            const obj = {
                "skillName": "",
                "skillLevel": ""
            }
            
            obj["skillName"] = inputJSON["skillName"][i];
            obj["skillLevel"] = inputJSON["skillLevel"][i];
            
            outputJSON["mySkills"]["programmingSkills"].push(obj);
        }
    } else {
        const obj = {
            "skillName": "",
            "skillLevel": ""
        }

        obj["skillName"] = inputJSON["skillName"];
        obj["skillLevel"] = inputJSON["skillLevel"];
            
        outputJSON["mySkills"]["programmingSkills"].push(obj);
    }
    
    if(typeof(inputJSON['toolName']) == 'object') {
        for(let i = 0; i < inputJSON['toolName'].length; i++) {
            const obj = {
                "toolName": "",
                "toolLevel": ""
            }
            
            obj["toolName"] = inputJSON["toolName"][i];
            obj["toolLevel"] = inputJSON["toolLevel"][i];
            
            outputJSON["mySkills"]["toolsAndFrameworks"].push(obj);
        }
    } else {
        const obj = {
            "toolName": "",
            "toolLevel": ""
        }
        
        obj["toolName"] = inputJSON["toolName"];
        obj["toolLevel"] = inputJSON["toolLevel"];
        
        outputJSON["mySkills"]["toolsAndFrameworks"].push(obj);
    }
    
    return outputJSON;
}

const Schema = mongoose.Schema;
const EducationSchema = new Schema({
    institutionName: String,
    place: String,
    year: Number,
    aggregate: Number,
    coursePursuied: String
});

const DurationSchema = new Schema({
    start: { type: String },
    end: { type: String }
});

const ExperienceSchema = new Schema({
    role: String,
    duration: DurationSchema,
    company: String,
    workDescription: [String],
    certificate: String
})

const ProjectSchema = new Schema({
    projectName: String,
    description: [String],
    gitHubLink: String,
    projectLink: String
});

const skillProElementSchema = new Schema({
    skillName: String,
    skillLevel: String
});

const skillToolElementSchema = new Schema({
    toolName: String,
    toolLevel: String
})

const SkillsSchema = new Schema({
    programmingSkills: [skillProElementSchema],
    toolsAndFrameworks: [skillToolElementSchema]
});

const ImageSchema = new Schema({
    url: String, filename: String
})

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200')
})

const PortfolioSchema = new Schema({
    user_id: String,
    name: String,
    mainDesignations: [String],
    description: String,
    profilePicture: ImageSchema,
    myEducation: [EducationSchema],
    myExperience: [ExperienceSchema],
    myProjects: [ProjectSchema],
    mySkills: SkillsSchema,
    myAchievements: [String],
    linkedIn: String,
    email: String,
    instagram: String,
    telephone: Number
});

const Portfolio = mongoose.model('Portfolio', PortfolioSchema);
const validatePortfolio = (doc) => {    
    const {error} = portfolioSchema.validate(doc);
    //console.log(result);

    if(error) {
        const msg = error.details.map(ele => ele.message).join(',')
        throw new ExpressError(msg, 400);
    }
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(async (req, res, next) => {
    const { authtoken, file } = req.headers;
    if(file) {
        req.file = file;
    }
    //console.log(authtoken);
    if(authtoken) {
        try {
            req.user = await admin.auth().verifyIdToken(authtoken);
            //console.log(req.user);
        }
        catch (e) {
            return res.sendStatus(400);
        }
    }
    req.user = req.user || {};
    next();
});

const MongoDBStore = MongoDBStorePackage(session);
const store = new MongoDBStore({
    uri : dbUrl,
    secret: secret,
    touchAfter: 24 * 60 * 60
});

store.on('error', function(error) {
    console.log("Session Store Error", error);
})
app.use(session({
    store,
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/api/portfolio/:id', async(req, res) => {
    const id = req.params.id;
    const data = await Portfolio.findById(id);
    res.json(data);
});

app.post('/edit/profilePicture/:id', upload.single('profilePicture'), async(req, res) => {
    try {
        const id = req.params.id;
        const data = await Portfolio.findById(id);
        console.log(req.file);
        if(req.user && data.user_id === req.user.user_id) {
            await cloudinary.uploader.destroy(data.profilePicture.filename)
            const file = req.file;
            const obj = {profilePicture: {url: file.path, filename: file.filename }};
            await Portfolio.findByIdAndUpdate(id, obj);
            res.status(200).send(`Success`);
        }
        else {
            await cloudinary.uploader.destroy(req.file.filename);
            res.status(400).send("Failure");
        }
    } catch(err) {
        console.log(err);
    }
});

app.post('/portfolio/edit/:id', async(req, res) => {
    const id = req.params.id;
    const updatedData = req.body;
    const data = await Portfolio.findById(id);
    console.log(updatedData)
    if(req.user && data.user_id === req.user.user_id) {
        const resultantObj = convertJSON(updatedData);
        resultantObj.user_id = req.user.user_id;
        validatePortfolio(resultantObj);
        await Portfolio.findByIdAndUpdate(id, resultantObj, {new: true});
        req.flash('success', 'Successfully Updated!');
        res.status(200).send(`Success`);
    } else {
        res.status(400).send("Failure");
    }
})

app.post('/portfolio/delete/:id', async(req, res) => {
    const id = req.params.id;
    const data = await Portfolio.findById(id);
    if(req.user && (data.user_id === req.user.user_id)) {
        await cloudinary.uploader.destroy(data.profilePicture.filename)
        await Portfolio.findByIdAndDelete(id);
        res.status(200).send("Success")
    } else {
        res.status(400).send("Failure");
    }
})

app.post('/portfolio/insert', upload.single('profilePicture'), async (req, res) => {
    if(req.user) {
        const obj = req.body;
        obj.profilePicture = req.file;
        console.log(obj);
        const resultantObj = convertJSON(obj);
        console.log(req.user);
        resultantObj.user_id = req.user.user_id;
        console.log(resultantObj);
        validatePortfolio(resultantObj);
        const mongooseObj = new Portfolio(resultantObj);
        await mongooseObj.save();
        res.status(200).send("Success");
    } else {
        await cloudinary.uploader.destroy(req.file.filename);
        res.status(400).send(400, "Failure");
    }
});

app.listen(8000, () => {
    console.log('server is listening on http://localhost:8000');
});