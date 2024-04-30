# MFT-Client-Backend
This is just one-half of the total project! The frontend can be found [here](https://github.com/Anonymoustank/mft-client).

## Install instructions:
- Clone this repository (or a fork of it)
- From the terminal, run "npm install" in the MFT-Client folder
- Run "npm run dev" in the MFT-Client folder
- Install the frontend and run it (instructions found in the link above)

## Contact:
Contact Pranav Kadekodi at pkadekodi3@gatech.edu if you have any questions.

## Available Scripts

### `npm run dev`

Run the server in development mode.

### `npm test`

Run all unit-tests with hot-reloading.

### `npm test -- --testFile="name of test file" (i.e. --testFile=Users).`

Run a single unit-test.

### `npm run test:no-reloading`

Run all unit-tests without hot-reloading.

### `npm run lint`

Check for linting errors.

### `npm run build`

Build the project for production.

### `npm start`

Run the production build (Must be built first).

### `npm start -- --env="name of env file" (default is production).`

Run production build with a different env file.


## Additional Notes

- If `npm run dev` gives you issues with bcrypt on MacOS you may need to run: `npm rebuild bcrypt --build-from-source`. 
