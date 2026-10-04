# User Stories

## Overview
This document contains the user stories and requirement traceability for the ACME Learning Center application.

## Requirement Traceability Matrix (RTM)

| User Story                                               | Bounded Context | Implemented Elements                                                                                              |
|:---------------------------------------------------------|:----------------|:------------------------------------------------------------------------------------------------------------------|
| **US-001: View List of Categories**                      | Publishing      | `CategoryList`, `PublishingStore`, `PublishingApi`, `CategoryAssembler`, `Category`                               |
| **US-002: Create a New Category**                        | Publishing      | `CategoryForm`, `PublishingStore`, `PublishingApi`, `CategoryAssembler`, `Category`                               |
| **US-003: Edit an Existing Category**                    | Publishing      | `CategoryForm`, `PublishingStore`, `PublishingApi`, `CategoryAssembler`, `Category`                               |
| **US-004: Delete a Category**                            | Publishing      | `CategoryList`, `PublishingStore`, `PublishingApi`, `CategoryAssembler`, `Category`                               |
| **US-005: View List of Tutorials**                       | Publishing      | `TutorialList`, `PublishingStore`, `PublishingApi`, `TutorialAssembler`, `Tutorial`                               |
| **US-006: Create a New Tutorial**                        | Publishing      | `TutorialForm`, `PublishingStore`, `PublishingApi`, `TutorialAssembler`, `Tutorial`                               |
| **US-007: Edit an Existing Tutorial**                    | Publishing      | `TutorialForm`, `PublishingStore`, `PublishingApi`, `TutorialAssembler`, `Tutorial`                               |
| **US-008: Delete a Tutorial**                            | Publishing      | `TutorialList`, `PublishingStore`, `PublishingApi`, `TutorialAssembler`, `Tutorial`                               |
| **US-009: View Home Page**                               | Shared          | `Home`, `Layout`                                                                                                  |
| **US-010: Switch Language**                              | Shared          | `LanguageSwitcher`, `Layout`, `i18n`                                                                              |
| **US-011: View About Page**                              | Shared          | `About`, `Layout`                                                                                                 |
| **US-012: View Page Not Found**                          | Shared          | `PageNotFound`, `router`                                                                                          |
| **US-013: Sign In**                                      | IAM             | `SignInForm`, `IamStore`, `IamApi`, `SignInAssembler`, `SignInCommand`, `SignInResource`, `UserAssembler`, `User` |
| **US-014: Sign Up**                                      | IAM             | `SignUpForm`, `IamStore`, `IamApi`, `SignUpAssembler`, `SignUpCommand`, `SignUpResource`                          |
| **US-015: Sign Out**                                     | IAM             | `AuthenticationSection`, `IamStore`                                                                               |
| **US-016: Route Authentication and Authorization Guard** | IAM             | `authenticationGuard`, `iamInterceptor`, `IamStore`, `router`                                                     |

## US-001: View List of Categories

**Description:** As an administrator, I want to view a list of all categories so that I can see the available categories in the system.

### Acceptance Criteria

#### Scenario 1: Viewing categories when categories exist
Given there are categories in the system  
When the administrator requests the list of categories,  
Then the system returns all categories

#### Scenario 2: Viewing categories when no categories exist
Given there are no categories in the system,  
When the administrator requests the list of categories,  
Then the system returns an empty list

## US-002: Create a New Category

**Description:** As an administrator, I want to create a new category so that I can add new topics for tutorials.

### Acceptance Criteria

#### Scenario 1: Creating a category with valid data
Given the administrator provides a category with a valid name  
When the administrator submits the category creation request,  
Then the system creates the category with an id and the provided name and confirms the creation

#### Scenario 2: Creating a category with invalid data
Given the administrator provides a category with an invalid name (e.g., empty or too long),  
When the administrator submits the category creation request,  
Then the system rejects the creation and provides an error message

#### Scenario 3: Creating a category with a duplicate name
Given a category with the same name already exists  
When the administrator submits the category creation request with a category having that name,  
Then the system rejects the creation and provides an error message indicating the name is not unique

## US-003: Edit an Existing Category

**Description:** As an administrator, I want to edit an existing category so that I can update category information.

### Acceptance Criteria

#### Scenario 1: Editing a category with valid data
Given an existing category  
When the administrator submits valid updated data for the category,  
Then the system updates the category and confirms the update

#### Scenario 2: Editing a category with invalid data
Given an existing category  
When the administrator submits invalid updated data for the category,  
Then the system rejects the update and provides an error message

#### Scenario 3: Editing a non-existent category
Given the category does not exist,  
When the administrator submits updated data for the category,  
Then the system rejects the update and provides an error message

## US-004: Delete a Category

**Description:** As an administrator, I want to delete a category so that I can remove unused categories.

### Acceptance Criteria

#### Scenario 1: Deleting an existing category
Given an existing category  
When the administrator submits the deletion request for the category,  
Then the system deletes the category and confirms the deletion

#### Scenario 2: Deleting a non-existent category
Given the category does not exist,  
When the administrator submits the deletion request for the category,  
Then the system rejects the deletion and provides an error message

#### Scenario 3: Deleting a category associated with tutorials
Given a category is associated with one or more tutorials  
When the administrator submits the deletion request for the category,  
Then the system rejects the deletion and provides an error message indicating the category is in use

## US-005: View List of Tutorials

**Description:** As an administrator, I want to view a list of all tutorials so that I can see the available tutorials in the system.

### Acceptance Criteria

#### Scenario 1: Viewing tutorials when tutorials exist
Given there are tutorials in the system  
When the administrator requests the list of tutorials,  
Then the system returns all tutorials

#### Scenario 2: Viewing tutorials when no tutorials exist
Given there are no tutorials in the system  
When the administrator requests the list of tutorials,  
Then the system returns an empty list

## US-006: Create a New Tutorial

**Description:** As an administrator, I want to create a new tutorial so that I can add new learning content.

### Acceptance Criteria

#### Scenario 1: Creating a tutorial with valid data
Given the administrator provides a tutorial with a valid title, summary, and an existing category  
When the administrator submits the tutorial creation request  
Then the system creates the tutorial with an id, the provided title, summary, categoryId, and category and confirms the creation

#### Scenario 2: Creating a tutorial with invalid data
Given the administrator provides a tutorial with invalid data (e.g., empty title),  
When the administrator submits the tutorial creation request,  
Then the system rejects the creation and provides an error message

#### Scenario 3: Creating a tutorial with a non-existent category
Given the specified category does not exist  
When the administrator submits the tutorial creation request with a tutorial having that category,  
Then the system rejects the creation and provides an error message

## US-007: Edit an Existing Tutorial

**Description:** As an administrator, I want to edit an existing tutorial so that I can update tutorial information.

### Acceptance Criteria

#### Scenario 1: Editing a tutorial with valid data
Given an existing tutorial  
When the administrator submits valid updated data for the tutorial,  
Then the system updates the tutorial and confirms the update

#### Scenario 2: Editing a tutorial with invalid data
Given an existing tutorial  
When the administrator submits invalid updated data for the tutorial,  
Then the system rejects the update and provides an error message

#### Scenario 3: Editing a non-existent tutorial
Given the tutorial does not exist  
When the administrator submits updated data for the tutorial,  
Then the system rejects the update and provides an error message

## US-008: Delete a Tutorial

**Description:** As an administrator, I want to delete a tutorial so that I can remove unused tutorials.

### Acceptance Criteria

#### Scenario 1: Deleting an existing tutorial
Given an existing tutorial  
When the administrator submits the deletion request for the tutorial,  
Then the system deletes the tutorial and confirms the deletion

#### Scenario 2: Deleting a non-existent tutorial
Given the tutorial does not exist  
When the administrator submits the deletion request for the tutorial,  
Then the system rejects the deletion and provides an error message

## US-009: View Home Page

**Description:** As a visitor, I want to view the home page so that I can get an overview of the learning center.

### Acceptance Criteria

#### Scenario 1: Viewing the home page
Given the user navigates to the home view  
When the system loads the home view,  
Then the system displays the home content

## US-010: Switch Language

**Description:** As a user, I want to switch the language so that I can view the content in my preferred language.

### Acceptance Criteria

#### Scenario 1: Switching to an available language
Given the user selects an available language  
When the user changes the language,  
Then the system updates the interface to the selected language

#### Scenario 2: Switching to an unavailable language
Given the user selects an unavailable language  
When the user changes the language,  
Then the system does not change the language and remains in the current language

## US-011: View About Page

**Description:** As a visitor, I want to view the about the business content so that I can learn more about the learning center.

### Acceptance Criteria

#### Scenario 1: Viewing the about page
Given the user navigates to the about the business view  
When the system loads the about the business view,  
Then the system displays the about content

## US-012: View Page Not Found

**Description:** As a user, I want to see a page not found message when I access an invalid route so that I know there is no content associated with that route.

### Acceptance Criteria

#### Scenario 1: Accessing an invalid route
Given the user accesses an invalid route,  
When the system cannot find the route,  
Then the system displays the page not found message including the unavailable route

#### Scenario 2: Navigating to home from a page not found
Given the user is on the page not found page  
When the user chooses to go to the home view,  
Then the system navigates the user to the home view

## US-013: Sign In

**Description:** As a registered user, I want to sign in to the application so that I can access protected features.

### Acceptance Criteria

#### Scenario 1: Signing in with valid credentials
Given the user provides valid username and password credentials  
When the user submits the sign-in form,  
Then the system authenticates the user, stores the authentication token, updates the session state, and redirects the user to the home view

#### Scenario 2: Signing in with invalid credentials
Given the user provides invalid username or password credentials  
When the user submits the sign-in form,  
Then the system rejects the authentication, records an error, and redirects the user back to the sign-in view

## US-014: Sign Up

**Description:** As a new user, I want to create an account so that I can register in the application.

### Acceptance Criteria

#### Scenario 1: Signing up with valid credentials
Given the user provides a valid username and password  
When the user submits the sign-up form,  
Then the system registers the new user and redirects the user to the sign-in view

#### Scenario 2: Signing up with invalid credentials or duplicate user
Given the user provides invalid data or an existing username  
When the user submits the sign-up form,  
Then the system rejects the registration, records an error, and redirects the user back to the sign-up view

## US-015: Sign Out

**Description:** As an authenticated user, I want to sign out so that I can terminate my session and protect my account.

### Acceptance Criteria

#### Scenario 1: Signing out from an active session
Given the user is currently signed in  
When the user chooses to sign out,  
Then the system clears the user session, removes the authentication token, and updates the interface to display unauthenticated options

## US-016: Route Authentication and Authorization Guard

**Description:** As a user, I want route access to be protected according to authentication status so that unauthorized users cannot access restricted resources.

### Acceptance Criteria

#### Scenario 1: Accessing a protected route while unauthenticated
Given the user is not authenticated  
When the user attempts to access a protected route (e.g., home or publishing routes),  
Then the system intercepts the navigation and redirects the user to the sign-in view

#### Scenario 2: Accessing a public route while unauthenticated
Given the user is not authenticated  
When the user accesses a public route (such as sign-in, sign-up, about, or page not found),  
Then the system allows navigation to the requested route

#### Scenario 3: Accessing a protected route while authenticated
Given the user is authenticated  
When the user accesses any application route,  
Then the system allows navigation to the requested route

