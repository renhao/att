var att = require("../att.js"),
    Project = require("./Project.js").Project,
    AttUtil = require("./AttUtil.js");

var Target = function () {
        this._commands = [];
    };

/**
 * a task defined in the project maybe owns some commands to be executed.
 */
Target.prototype.addCommand = function (commandName, options) {
    this._commands.push({
        commandName: commandName,
        options: options
    });
};

/**
 * run the task, then the commands in this task will executed one by one.
 */
Target.prototype.run = function (callback, itemCallback) {
    var self = this;
    AttUtil.doSequenceTasks(this._commands, function (commandData, commandCallback) {
        var format = function (v) {
                return Project.currentProject.format(v);
            },
            commandName = format(commandData.commandName),
            options = {};

        for (var i in commandData.options) {
            var ci = commandData.options[i];
            if (typeof ci == 'string') {
                options[i] = format(ci);
            } else {
                options[i] = ci;
            }
        }
        att.executeCommand(commandName, options, function (err, data) {
            itemCallback && itemCallback(err, commandName, data);
            if (err) {
                callback(err);
            } else {
                commandCallback();
            }
        });

    }, callback);
};

exports.Target = Target;