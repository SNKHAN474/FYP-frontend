# Setup Instructions

`npm i` - Install packages

`npm run dev` - Run the application locally

# Project Structure

**public:** should be used for any files used in the index.html head tag, such as favicon files

**public/models:** contains files used for rendering 2D images and 3D models, these are for demo
purposes locally and will be removed once endpoints are being used instead

**src/app:** contains root tsx file, global css file and generated route types file

**src/assets/images:** contains images the app uses

**src/module:** contains modules which have components that are used in one place

**src/routes:** contains all the route files used to determine the routes of the app

**src/shared:** contains api services, components which are used in multiple places, form schemas
and utils folder which has constants, helpers and query client

**src/types:** contains all types which are used in multiple places

**tests:** contains component and e2e tests

# Core Technologies Used

**TanStack Router:** [Documentation](https://tanstack.com/router/v1/docs/framework/react/overview)

**TanStack Table:** [Documentation](https://tanstack.com/table/latest/docs/introduction)

**TanStack Query:** [Documentation](https://tanstack.com/query/latest/docs/framework/react/overview)

**React Three Fiber:**
[Documentation](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)

**React Hook Form:** [Documentation](https://react-hook-form.com/get-started#Quickstart)

# Endpoint Integration

**src/shared/api/services:** this contains files for each service, each service file will contain
functions which will directly call the api (currently mocked with dummy data)

**src/routes:** in any of the route files a loader property on the "Route" object can be defined,
this is where the service functions will be called that get data (dummy data example can be found in
"src/routes/\_protected/patients")

**custom hooks such as useLoginForm:** in custom hooks such as this or any others which contain the
useMutation hook, where the mutationFn is defined is where the service functions will be called for
post, put or delete requests