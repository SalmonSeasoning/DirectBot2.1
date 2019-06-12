/*
	DirectBot-Remastered Discord Bot
	(C) Copyright Ty Qualters 2018
	Please read the license file for more details (Apache 2)
*/

/*	Configuration	*/
const config = {
	botPrefix: "++",
	botToken: "" || process.env.BOT_TOKEN,
	adminUserIds: [''], 
	database: {
		dbhost: '',
		dbuser: '',
		dbpass: '',
		dbname: '',
		requireConnection: false
	}
};

// make the object static so that things don't change (comment out if you are planning on changing values later!)
Object.freeze(config);

/*	Global Constants and Variables	*/
const Discord = require('discord.js'),
	client = new Discord.Client(),
	fs = require('fs'),
	{ botToken, botPrefix, adminUserIds, database } = config,
	MySQL = require('mysql'),
	MySQLConnection = MySQL.createConnection({
		host: database.dbhost,
		user: database.dbuser,
		password: database.dbpass,
		database: database.dbname
	});

/*	Classes	*/
class Command {
	constructor(name, func, description, elevated, requireDB) {
		this.commandName = name;
		this.commandFunction = func;
		if (objectExists(description)) {
			this.commandDescription = description;
		} else {
			this.commandDescription = 'No description provided.';
		}
		if (objectExists(elevated)) {
			this.commandElevated = Boolean(elevated);
		} else {
			this.commandElevated = false;
		}
		if(objectExists(requireDB)) {
			this.commandRequiresDB = boolean(requireDB);
		}else{
			this.commandRequiresDB = false;
		}
	}
	static requireDBFunc () {
		return console.error('Attempted to execute a command, but ran into Database Connection Error.');
	}
	call() {
		if(MySQLConnection.state === 'disconnected' && this.commandRequiresDB === true){
			return requireDBFunc(...arguments);
		}
		this.commandFunction(...arguments);
	}
	returnData() {
		return {
			commandName: this.commandName,
			commandFunction: this.commandFunction,
			commandDescription: this.commandDescription,
			commandElevated: this.commandElevated,
			commandRequiresDB: this.commandRequiresDB
		}
	}
};

/*	Universal Objects and Functions	*/
function getKeyByValue(object, value) {
	return Object.keys(object).find(key => object[key] === value);
}

function formatSnippet(text, type) {
	return '```' + type + '\n' + text + '\n```';
}

const Commands = [];

function objectExists(obj) {
	if (obj !== null)
		if (obj !== undefined)
			return true;
	return false;
}

function assert(condition) {
	if (!condition) {
		throw 'Assert condition returned false. There could be an issue going on here.';
	}
}

/*	Commands		*/
Commands.push(
	new Command('help', (message, text) => {
		let list = [];
		for (cmd in Commands) {
			let data = Commands[cmd].returnData();
			list.push(`${botPrefix}${data.commandName.toLowerCase()}${(data.commandElevated?' (elevated)':'')} -- ${data.commandDescription}`);
		}
		message.reply(formatSnippet(list.join('\n')));
	}, 'Lists available commands.')
);

Commands.push(
	new Command('spam', (message, text) => {
		let args = text.split(' ');
		let numoftimes = ~~Number(args[0]);
		if (!objectExists(numoftimes) || numoftimes <= 0 || numoftimes >= 50) {
			message.reply('Number of times to spam is invalid. Must be a number between 1-50.');
			return;
		}
		args.shift();
		let tospam = args.join(' ');
		if (!tospam.length >= 1) {
			message.reply('There needs to be something to spam!');
			return;
		}
		console.log(`@${message.author.username}#${message.author.discriminator} (ID: ${message.author.id}) spamming a message ${numoftimes} times`);
		message.reply(`Spamming message for ${numoftimes} time(s) [${new Date()}]`);
		for (let i = 0; i < numoftimes; i++) {
			message.channel.send(tospam);
		}
	}, 'Spams a message a specified number of times.')
);

Commands.push(
	new Command('nuke-channel', (message, text) => {
		if (message.member.hasPermission('MANAGE_MESSAGES')) {
			message.channel.bulkDelete(100).then(() => {
				message.channel.send('Successfully nuked channel.');
			}, (err) => {
				message.reply('whoops! Something went wrong.');
			});
		} else {
			message.channel.send('You do not have permission to do that!');
		}
	}, 'Bulk deletes messages in a channel.')
);

Commands.push(
	new Command('kill', (message, text) => {
		console.log(`@${message.author.username}#${message.author.discriminator} (ID: ${message.author.id}) killed bot. [${new Date()}]`);
		process.exit(0);
	}, 'Kills the bot.', true)
);

Commands.push(
	new Command('eval', (message, text) => {
		console.log(`@${message.author.username}#${message.author.discriminator} (ID: ${message.author.id}) using eval: ${text} [${new Date()}]`);
		try {
			eval(text);
		} catch (except) {
			message.reply(`Failed to execute commands: ${except}`);
			console.log(`@${message.author.username}#${message.author.discriminator} (ID: ${message.author.id}) eval commands threw an error.`);
			return;
		}
		message.reply('Successfully executed commands.');
	}, 'Executes specified commands', true)
);

Commands.push(
	new Command('whois', (message, text) => {
		let user = null;
		if (objectExists(text.split(' ')[0])) {
			user = text.split(' ')[0];
		}
		console.log(`@${message.author.username}#${message.author.discriminator} (ID: ${message.author.id}) using whois: ${user}`);

		if (user) {
			try {
				let user = client.users.get(text.split(' ')[0]);
				message.author.send('That user is @' + user.username + '#' + user.discriminator)
					.then(() => {
						message.reply('Details sent via DM!');
					}, () => {
						message.reply('Failed to DM you details. Check your privacy settings for this server before trying again.');
					}
					);
			} catch (except) {
				message.reply('Oops! Something went wrong. Maybe the user does not exist.');
			}
		} else {
			message.reply('User ID was not supplied.');
		}
	}, 'Identifies a user by their ID.')
);

Commands.push(
	new Command('invitebot', (message, text) => {
		client.generateInvite(['ADMINISTRATOR']).then((link) => {
			message.author.send(`Here is the bot's invite link: ${link}`).catch(message.reply('Cannot send you a DM!'));
		});
	}, 'Get a bot invite code!')
);

Commands.push(
	new Command('createinvite', (message, text) => {
		message.channel.createInvite({}, 'User-Generated').then((invite) => {
			message.reply(`Here is the invite: https://discord.gg/${invite.code}`);
		}, () => {
			message.reply('Failed to create invite code. Probably due to a lack of permissions.');
		});
	}, 'Create a Discord channel invite.')
);

Commands.push(
	new Command('kick', (message, text) => {

		let member = message.mentions.members.first() ? message.mentions.members.first() : null;
		if (member === null) {
			return message.reply('No user specified.');
		}
		let user = member.user;

		if (message.author !== message.guild.owner) {

			if (!message.member.hasPermission('KICK_MEMBERS')) {
				return message.reply('You do not have the permissions required to kick members!');
			}

			if (member.kickable) {
				member.kick('Kicked by hoisted user : @' + message.author.username + '#' + message.author.discriminator).then(() => {
					message.channel.send(user.tag + ' has been kicked!');
				}, () => {
					message.reply('Failed to kick member! No further details can be provided.');
				});
			} else {
				message.reply('This member is not kickable!');
			}

		} else {
			// server owner

			if (!member.kickable) {
				return message.reply('This member is not kickable!');
			}

			member.kick('Kicked by Server Owner').then(() => {
				message.channel.send(user.tag + ' has been kicked!');
			}, () => {
				message.reply('Failed to kick member! No further details can be provided.');
			});
		}

	}, 'Kick a member from the server.')
);

Commands.push(
	new Command('ban', (message, text) => {

		let member = message.mentions.members.first() ? message.mentions.members.first() : null;
		if (member === null) {
			return message.reply('No user specified.');
		}
		let user = member.user;

		if (message.author !== message.guild.owner) {

			if (!message.member.hasPermission('BAN_MEMBERS')) {
				return message.reply('You do not have the permissions required to ban members!');
			}

			if (member.bannable) {
				member.ban('Banned by hoisted user : @' + message.author.username + '#' + message.author.discriminator).then(() => {
					message.channel.send(user.tag + ' has been banned!');
				}, () => {
					message.reply('Failed to ban member! No further details can be provided.');
				});
			} else {
				message.reply('This member is not bannable!');
			}

		} else {
			// server owner

			if (!member.bannable) {
				return message.reply('This member is not bannable!');
			}

			member.ban('Banned by Server Owner').then(() => {
				message.channel.send(user.tag + ' has been Banned!');
			}, () => {
				message.reply('Failed to ban member! No further details can be provided.');
			});
		}

	}, 'Ban a member from the server.')
);

Commands.push(
	new Command('whois-server-owner', (message, text) => {
		message.author.send('The server owner for `' + message.guild.name + '` is @' + message.guild.owner.user.username + '#' + message.guild.owner.user.discriminator
			+ '.. Please be nice and try not to annoy them.')
			.then(() => {
				message.reply('Details sent via DM!');
			}, () => {
				message.reply('Failed to DM you details. Check your privacy settings for this server before trying again.');
			}
			);
	}, 'Find out who the server owner is.')
);

/*	Bot Ready	*/
client.on('ready', () => {
	if (!client.user.bot) {
		console.error('Signed in as a user account! Exiting.');
		process.exit(0);
	}
	console.log(`Logged in as @${client.user.username}#${client.user.discriminator} and connected to ${client.guilds.array().length} guild(s)!`);
	console.log(`Using prefix "${botPrefix}" for commands.`);
	MySQLConnection.connect((err)=>{
		if(err) {
			console.error(err.message);
			console.error('Failed to connect to MySQL database!');
			// honestly, you should just leave requireConnection as 'false' so that the app doesn't just exit on startup.
			if(config.database.requireConnection) {
				console.error('Exiting application due to failure to connect to the database.');
				process.exit(0);
			}
		} else console.log('Successfully connected to MySQL database!');
	});
	client.user.setActivity(`${botPrefix}help`);
	client.user.setStatus('online');
});

client.on('message', (message) => {
	if (message.content.startsWith(botPrefix) && !message.author.bot && message.guild) {
		let beginningText = message.content.split(' ')[0].substring(botPrefix.length);
		for (command in Commands) {
			let currentCommand = Commands[command].returnData();
			if (beginningText.toLowerCase() == currentCommand.commandName.toLowerCase()) {

				// check if user is elevated
				if (currentCommand.commandElevated === true)
					if (!adminUserIds.includes(message.author.id)) {
						message.reply('You are not authorized to use this command. This command is restricted to bot administrators.');
						break;
					}

				console.log(`User @${message.author.username}#${message.author.discriminator} (ID: ${message.author.id}) is using command '${Commands[command].returnData().commandName}' in guild ${message.guild.name} (ID: ${message.guild.id}) [${new Date()}]`);
				let text = message.cleanContent.split(' ');
				text.shift();
				text = text.join(' ');
				Commands[command].call(message, text);
				break;
			}
		}
	}
});

/*	Client Events	*/
client.on('guildCreate', (guild) => {
	console.log(`Joined guild ${guild.name} [${new Date()}]`);
});
client.on('guildDelete', () => {
	console.log(`Removed from guild ${guild.name} [${new Date()}]`);
});
client.on('disconnect', () => {
	console.log('Disconnected from Discord. Not going to attempt a reconnect.');
});
client.on('reconnecting', () => {
	console.log('Disconnected. Attempting to reconnect.');
});
client.on('error', (err) => console.log);
client.on('warn', (i) => console.log);
client.on('debug', (i) => console.log);

/*	Login	*/
client.login(botToken);

// courtesy of iComputer7:

/* This is so the docker container stops on Ctrl+C */
process.on("SIGINT", () => {
	client.destroy();
	process.exit();
})