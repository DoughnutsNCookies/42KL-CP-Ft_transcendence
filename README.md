# 42KL-CP-Ft_transcendence

PongSH is a web application that offers 42 students the experience of playing modern Pong.

The app includes additional features like friend management and chat functionality. 

With a terminal theme design, PongSH brings a nostalgic touch to the gaming interface, appealing to both retro and contemporary gaming enthusiasts.

This project took us two and a half months to learn everything and to create PongSH from scratch.


## Video Demo

You can check out this link to the showcase video where I presented this project

Link: https://youtu.be/xx9_5AKXx6Y

More than 100 individuals of academic professionals, parents, students, and even representatives from the Malaysian Qualifications Agency (MQA) attended the showcase session.

We also received commendations for the projects’ contribution to promoting interactive and engaging online experiences.


## Gameplay Demo

![Gameplay Demo](https://github.com/DoughnutsNCookies/42KL-CP-Ft_transcendence/blob/main/readmeAssets/PongSH-gif.gif)

## Features

**Player Features**
- 42 OAuth Login or Google Login
- Two-factor authentication with Google Authentication
- Customizable profile
    - Username
    - Profile picture
- Player real-time status
    - Online
    - Offline
    - In-game
- Player statistics
    - Wins and losses
    - Punching bag and worst nightmare (Players you've won and lost against the most)
    - Match history
    - Leaderboard ranking
- Friendship system
    - Add and unfriend players
    - Block and unblock players
- Other fun commands


**Chat Features**
- Creating channels
    - Public channels
    - Private channels (Invite only)
    - Password-protected channels
- Sending direct messages
- New message notification (Inspiration from Discord)
- Admin-only actions
    - Kick players (Player is removed from the channel but still can rejoin)
    - Ban players (Player is removed from the channel and cannot rejoin)
    - Mute players (Player cannot type in the channel)
    - Assign players as admin
- Game invitation through chat
- Accessing player's profiles through the chat interface


**Pong Game Features**
- Custom matchmaking system
- Responsive gameplay using sockets
- Boring, standard, and deathmatch game modes
- Curving ball mechanic
- Custom-made paddles for special effects
    - Faster ball after contact
    - Stronger spin on the ball after contact
    - Longer paddle
    - Magnetic paddle to control ball trajectory
- Random field effects during the game
    - Floating block
    - Black hole
    - Negative and positive gravity
    - Speed up and slow down fields


**Additional Backend Features**
- Strong password hashing algorithm
- SQL injection protection
- Server-side validation for user input

## Tech Stack
**Frontend:** Vite, React, Pixi.JS, Tailwind

**Backend:** NestJS, PostgreSQL, TypeORM

**API:** 42API, GoogleAPI, SMTP, Socket.io, Axios


## Team members

- [@DoughnutsNCookies](https://www.github.com/DoughnutsNCookies)
- [@Ricky0625](https://www.github.com/Ricky0625)
- [@ijontan](https://www.github.com/ijontan)
- [@MTLKS](https://www.github.com/MTLKS)
- [@Zedith111](https://www.github.com/Zedith111)

