# DirectBot2.1
DirectBot2.1 (a.k.a. DirectBot Remastered) is a modified, more object-oriented Node.js Discord bot.

# About
DirectBot2.1 uses JavaScript classes (ES6 standard) and [Discord.js](https://github.com/hydrabolt/discord.js) for an easier, more organized way of implementing custom commands. (Note: Discord.js Commando is NOT used!) While, right now, it's definitely not the cleanest code in the whole galaxy, it shouldn't be too hard to work with and clean up if necessary. It also allows for ease of use with commands restricted to only certain users ("bot administrators"). This is especially useful when you want to have yee ol' eval command accessible to you and your fellow developers. Or who knows? Maybe just for you. You really do need to make some friends.

# Installing
Since this is just a standard Node.js package, all you really have to do is make sure that Discord.js (+other dependencies) are installed .. and obviously Node.js. You must also have a decent internet connection and a decent system (unless you're okay with having a slow, barely functioning bot), but I mean, it works just fine on a decently sized Discord server using just a Raspberry Pi 3B.

# Adding custom commands
So obviously you need to know JavaScript. If you're a TypeScripter, I'm not too sure on the compatibility as I don't use it. I'm good enough at JavaScript that transforming it into a static version of the same language seems very unnecessary.

To start off, you need to append a command to the array of commands. Yes, there is literally just an array of commands. You can laugh at the lazy programming all you want, it works, and it works well enough.

To do so, we will start out like this:
```
Commands.push(
  new Command();
);
```
Commands is the array and you're pushing a new Command (class) to the array.
Next, the parameters are set up like so: `Command( stringName, Function, stringDescription, boolElevated )`
So the first argument will be a string, the name of the command. The second argument will be the function you will be passing, it can be an arrow function, an anonymous function, or a standard function; you just have to pass the function correctly or it will not work. The third argument will be a string, a description for your help command to provide some context on what the command does. And last, but not least, the most important thing for those sensitive commands that only you and some special others can have access to, a bool that decides whether the command should be restricted to bot administrators or not. Only the first two arguments are required for the command, the rest will be filled in automatically to avoid errors and a waste of that sweet sweet time of yours. You're welcome, thank me later.

So, putting it all together now:
```
Commands.push(
  new Command('commandnamegoeshere', (message,text)=>{
    // message is the message object generated by Discord.js
    // text is just message.cleanContent
    message.reply('Hi noob');
  }, 'this command does a thing' /* ,true */);
);
```
With the default everything, except Bot Token because you need that, you should be able to call ++commandnamegoeshere and have the bot message you back "Hi noob" without any issues, disregarding API/system/connection issues.

# Account Token
Just go to [Discord Developers](https://discordapp.com/developers) and register an app. Then make sure you turn it into a Bot User to get your token. Ezpz. Oh, but get this? *You have to be signed in!* Spooky, amirite?
