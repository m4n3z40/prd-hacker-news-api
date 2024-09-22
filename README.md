<a name="readme-top"></a>

# Product Hacker News API

An API for the enhanced clone of [Hackernews](https://news.ycombinator.com) for Product Hackers.

## Table of Contents
<details>
<summary>Click to expand</summary>

- [Technology and Frameworks](#technology-and-frameworks)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
- [Roadmap](#roadmap)
- [License](#license)
- [Contact](#contact)

</details>

## Technology and Frameworks

- [Node.js](https://nodejs.org/)
- [Fastify](https://fastify.dev/)
- [Turso / LibSQL](https://turso.tech/)

<p align="right">(<a href="#readme-top">Back to top 👆</a>)</p>

## Getting Started

### Prerequisites

- Node.js @ `^22.2.0`
  ```sh
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  nvm install 22
  ```

### Installation

1. Clone the repo
   ```sh
   git clone git@github.com:m4n3z40/prd-hacker-news-api.git
   ```

   1.1. (Optional) Choose the tag you want to follow from
   ```sh
   git checkout mod4-aula1-01
   ```

2. Install NPM packages
   ```sh
   npm install
   ```

3. Migrate database
   ```sh
   node --run db:migrate
   ```

3. Run the dev server
   ```sh
   node --run start
   ```

<p align="right">(<a href="#readme-top">Back to top 👆</a>)</p>

## Database Structure

![Database model structure](src/data/phn.png "Database model structure")

## Roadmap

- [x] Install astro
- [x] Add README, LICENSE and .Editorconfig
- [x] Implement Hackernews HTML code
    - [x] Mobile screens related code
    - [x] Desktop screens related code
    - [ ] SEO & accessibility
- [x] Style with CSS
    - [x] Mobile screens related code
    - [x] Desktop screens relatad code
- [x] Make it work with Javascript behaviors
- [x] Make it persist with database
- [ ] Make it scallable and reliable
- [ ] Make it secure
- [ ] Make it distributed Blockchain
- [ ] Make it smart with Generative AI

<p align="right">(<a href="#readme-top">Back to top 👆</a>)</p>

## License

This project is licensed under the [LICENSE.txt](./LICENSE.txt) file.

<p align="right">(<a href="#readme-top">Back to top 👆</a>)</p>

## Contact

For any questions or feedback, please contact the author at [allan@beanimus.com](mailto:allan@beanimus.com).

Project website: [https://github.com/m4n3z40/prd-hacker-news](https://github.com/m4n3z40/prd-hacker-news)

<p align="right">(<a href="#readme-top">Back to top 👆</a>)</p>
