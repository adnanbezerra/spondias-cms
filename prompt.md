You are a senior software engineer working on NextJS.

Project context:
We are building a software for a plants shop. It will be a monolyth built with NextJS with heavy server-side pages usage

Task:
This website must be as simple as possible, so we won't use checkout nor anything. We must always redirect to whatsapp on the buy now buttons, and also we must have a hovering whatsapp icon to the side of the app.

This very will basically revolve around two main areas: the main website, which will display the different products categories, sections, and the products themselves. So, for instance, as we should deal with plants, there should be a category for plants that need lots of sun, and they can be ground plants, plants to hang in vases, etc, so these are sections. The second part is the administrative area to manage all of it

We can also have a section that is just a banner for cosmetic purposes to be displayed in the main area, to advertise discounts etc

First of all, we must create a connection with a PostgreSQL database and Prisma and create a simple auth route with JWT and register/login endpoints. Next, we will create CRUD endpoints related to creating content sections and to uploading images to our bucket (we haven't defined which bucket to use yet)

Then, we will create an administrative area to allow management of it: it should have a config area to manage whatsapp number, the address of the store, etc, and then we should be able to create products and manage their section and category. note that products can have different sections and categories

And in the main area we should display what's been configured by the administrator. We should have a main screen which will function more or less like a feed and in the topbar there should be a navigation to dedicated pages for each category we have configured

In the footer we will add some informations that should be configured as well, such as email, whatsapp again, shop address, company name and CNPJ, etc

Constraints:
It should be very simple in terms of UX
The main screen must be rendered server-side for maximum speed of navigation
All API and database connection parts should be server-side to avoid data breaches
We should avoid data breaches at all costs

Input:
We have our logo at /public/logo.jpg, and it has our primary and secondary colors as well

We should have more or less these schemas:
User
id, uuid
email unique
cpf unique
password string
isActive bool
createdAt, updatedAt

Section
id, uuid
name string
isActive bool
order number (to manage render order on frontend)
isBanner bool, bannerImg str
createdAt, updatedAt

Category
id, uuid
name string
isActive bool
createdAt, updatedAt

Product
id, uuid
name string
price int (in BR centavos)
stock int
discountPercentage int
image string
isActive bool
createdAt, updatedAt

and relations between product with section and section with category