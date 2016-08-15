# Population.io

## Setup

* Clone the repository
* Install node.js ([nodejs.org](http://nodejs.org))
* Install package manager `bower`

        $ npm install -g bower

* Install build system `gulp`

        $ npm install -g gulp

* Install dependencies

        $ npm install
        $ bower install

* Install required `nib` module for `gulp-stylus`

        $ cd node_modules/gulp-stylus
        $ npm install nib

## Run

* Navigate to *PROJECT_ROOT* and start the server by using `gulp`

        $ gulp

* Open http://localhost:1983

## Deploy

1. Copy `aws-credentials.json.sample` to `aws-credentials.json`
2. In `aws-credentials.json`:
    * Set required credentials: `accessKeyId` and `secretAccessKey`
    * Check whether AWS Bucket is correct (`Bucket` key).
3. Run `gulp deploy`
