let keycodes = [

    8,//Backspace 	Backspace 	
    9,//Tab 	Tab 	
    13,//Enter 	Enter 	
    16,//Shift 	ShiftLeft 	event.shiftKey is true
    16,//Shift 	ShiftRight 	event.shiftKey is true
    17,//Control 	ControlLeft 	event.ctrlKey is true
    17,//Control 	ControlRight 	event.ctrlKey is true
    18,//Alt 	AltLeft 	event.altKey is true
    18,//Alt 	AltRight 	event.altKey is true
    19,//Pause 	Pause 	
    20,//CapsLock 	CapsLock 	
    27,//Escape 	Escape 	
    32,//	Space 	The event.key value is a single space.
    33,//PageUp 	PageUp 	
    34,//PageDown 	PageDown 	
    35,//End 	End 	
    36,//Home 	Home 	
    37,//ArrowLeft 	ArrowLeft 	
    38,//ArrowUp 	ArrowUp 	
    39,//ArrowRight 	ArrowRight 	
    40,//ArrowDown 	ArrowDown 	
    44,//PrintScreen 	PrintScreen 	
    45,//Insert 	Insert
    46,//Delete

    //a-z
    48,
    49,
    50,
    51,
    52,
    53,
    54,
    55,
    56,
    57,
    65,
    66,
    67,
    68,
    69,
    70,
    71,
    72,
    73,
    74,
    75,
    76,
    77,
    78,
    79,
    80,
    81,
    82,
    83,
    84,
    85,
    86,
    87,
    88,
    89,
    90,
    //
    186,	//; Semicolon 	 The event.which value is 59 in Firefox
    59, 	//; Semicolon 	 The event.which value is 59 in Firefox
    187,// = Equal 	 The event.which value is 61 in Firefox
    61,// = Equal 	 The event.which value is 61 in Firefox
    188,// Comma 	
    189,// Minus 	 The event.which value is 173 in Firefox
    173,// Minus 	 The event.which value is 173 in Firefox
    190,//Period 	
    191, // Slash
    192,	//	Backquote 	
    219, //	BracketLeft 	
    220,// 	Backslash 	
    221, //		BracketRight 	
    222 // 	Quote
];
class KeyboardGamepad
{
    constructor()
    {
        this.id = "keyboard";
        this.buttons = [];
        this.index = 999;
        this.connected = false;

        for (var i = 0; i < keycodes.length; i++)
        {
            this.buttons[i] = { pressed: false, keycode: keycodes[i] };
        }
    }

    setKeyState(down, keycode)
    {
        for (var i = 0; i < this.buttons.length; i++)
        {
            if (this.buttons[i].keycode == keycode)
            {
                this.buttons[i].pressed = down;
                break;
            }

        }
    }
}

class ControllerSetupLogic
{
    constructor(game)
    {
        let scope = this;
        this.game = game;
        this.setupControllerUI = [new UIClickable(this.game.screen.w - 100, this.game.screen.h - 50, 100, 50, null, "gray", "Back", function () { scope.game.GotoMatchSetup(); })
        ];
        let keybinds = ["Attack", "Jump", "Up", "Down", "Left", "Right"];
        for (var i = 0; i < keybinds.length; i++)
        {
            let ui = new UIClickable(this.game.screen.W2(), 0 + 30 + (i * 60), 100, 50, null, "gray", keybinds[i], function () { /*scope.BindKeyForCurrentController(keybinds[i]);*/ });
            this.setupControllerUI.push(ui);
        }
        this.bindingUiStart = this.setupControllerUI.length;
        for (var i = 0; i < keybinds.length; i++)
        {
            let ui = new UIClickable(this.game.screen.W2() + 110, 0 + 30 + (i * 60), 100, 50, null, "gray", "", function () { });
            this.setupControllerUI.push(ui);
        }
        this.setupControllerDynaUI = [];
        this.currentPad = null;

        this.setupI = -1;
        this.setupbuttontimeout = -1;
        this.SetupGamePads();
    }

    TryReconnect(pad)
    {
        for (var pi = 0; pi < this.game.players.length; pi++)
        {
            let p = this.game.players[pi];
            if (p.gamepad.gp.id == pad.gp.id)
            {
                console.log("reconnect player for " + pad.gp.index + " " + this.game.players.length);
                p.gamepad = pad;
                return true;
            }

        }
        return false;
    }
    SetupGamePads()
    {

        let scope = this;

        window.addEventListener("gamepadconnected", function (e)
        {
            console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.", e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
            let pad = new PlayerGamePad(e.gamepad);

            if (scope.TryReconnect(pad) == false)
            {
                //new
                scope.game.gamePads.push(pad);
                scope.AddControllerToUi(pad);
            }
        });

        window.addEventListener("gamepaddisconnected", function (e)
        {
            console.log("Gamepad disconnected from index %d: %s", e.gamepad.index, e.gamepad.id);

            scope.DisconnectGamePad(e.gamepad);

        });

    }
    DisconnectGamePad(gamepad)
    {
        for (var i = 0; i < this.game.gamePads.length; i++)
        {
            if (this.game.gamePads[i].gamepadid == gamepad.index)
            {
                let p = this.game.gamePads[i].boundPlayer;
                //for (var pi = 0; pi < this.players.length; pi++)
                //{
                //    if (p.gamepad == this.game.gamePads[i])
                //    {
                //        console.log("disconnected player for " + this.game.gamePads[i].gp.index + " " + this.game.players.length);
                //        p.gamepad = null;
                //        break;
                //    }

                //}
                this.game.gamePads.splice(i, 1);

                break;
            }

        }
    }
    Logic()
    {
        if (this.setupI > -1)
        {
            this.UpdateBindDisplay();

            let gp = this.currentPad;
            console.log("BindCurrentButton");
            this.BindCurrentButton();
        }
    }
    BindCurrentButton()
    {
        if (this.setupbuttontimeout != -1 && this.currentPad.gp.buttons[this.setupbuttontimeout].pressed)
        {
            return;
        }
        for (var bi = 0; bi < this.currentPad.gp.buttons.length; bi++)
        {
            if (this.currentPad.gp.buttons[bi].pressed)
            {
                console.log(this.currentPad.buttons[this.setupI].button + " bi " + bi);
                this.currentPad.buttons[this.setupI].button = bi;
                this.setupbuttontimeout = bi;
                this.NextSetupStep();
                break;
            }
        }
    }
    NextSetupStep()
    {

        this.UpdateBindDisplay();
        this.setupI++;
        if (this.setupI >= this.currentPad.buttons.length)
        {
            this.setupI = -1;
            this.currentPad.setupComplete = true;
            let json = JSON.stringify(this.currentPad.buttons);
            localStorage.setItem("gamepadcfg" + this.currentPad.gp.id, json);
            this.UpdateBindDisplay();
        }
    }
    AddControllerToUi(pad)
    {
        let scope = this;
        this.setupControllerDynaUI.push(new UIClickable(10, 30 + (this.setupControllerDynaUI.length * 60), 250, 50, null, "gray", pad.gp.id, function () { scope.SetCurrentController(pad); }));
        this.setupControllerDynaUI.push(new UIClickable(270, 30 + ((this.setupControllerDynaUI.length - 1) * 60), 100, 50, null, "gray", "Start setup", function () { scope.SetupCurrentController(pad); }));
    }

    SetupCurrentController(pad)
    {
        this.SetCurrentController(pad);
        this.setupI = 0;
        this.setupbuttontimeout = -1;
        this.UpdateBindDisplay();
    }
    UpdateBindDisplay()
    {

        for (var i = 0; i < this.currentPad.buttons.length; i++)
        {
            let ui = this.setupControllerUI[this.bindingUiStart + i];

            ui.text = this.currentPad.buttons[i].button + "";
            ui.color = "gray";
            if (i == this.setupI)
            {
                ui.color = "orange";

            }
        }
    }
    SetCurrentController(pad)
    {
        this.currentPad = pad;
        for (var i = 0; i < this.setupControllerDynaUI.length; i++)
        {
            this.setupControllerDynaUI[i].color = "gray";
            if (this.setupControllerDynaUI[i].text == pad.gp.id)
            {
                this.setupControllerDynaUI[i].color = "orange";

            }

        }
        this.UpdateBindDisplay();
    }
}
class PlayerGamePad
{
    constructor(gamepad)
    {
        this.boundPlayer = null;
        this.gp = gamepad;
        this.gamepadid = gamepad.index;
        this.setupComplete = false;
        this.buttons = [new BoundKey("attack/ok"), new BoundKey("jump/cancel"), new BoundKey("up"), new BoundKey("down"), new BoundKey("left"), new BoundKey("rigth")];

        let json = localStorage.getItem("gamepadcfg" + this.gp.id);
        if (typeof (json) == 'undefined' || json == null)
        {
            if (this.gp.id == "keyboard")
            {
                json = '[{"button":57,"name":"attack / ok"},{"button":59,"name":"jump / cancel"},{"button":18,"name":"up"},{"button":20,"name":"down"},{"button":17,"name":"left"},{"button":19,"name":"rigth"}]';
                localStorage.setItem("gamepadcfg" + this.gp.id, json);
                this.buttons = JSON.parse(json);
                this.setupComplete = true;
            }
        }
        else
        {
            this.setupComplete = true;
            this.buttons = JSON.parse(json);
        }

        this.attack = 0;
        this.ok = 0;
        this.jump = 1;
        this.cancel = 1;


        this.up = 2;
        this.down = 3;
        this.left = 4;
        this.right = 5;

        //this.axis = [new BoundAxis("up"), new BoundAxis("down")];
    }
    IsPressed(button)
    {
        if (this.buttons[button].button == null)
        {
            return false;
        }
        return this.gp.buttons[this.buttons[button].button].pressed;
    }

    OutState()
    {
        let state = this.gp.id;
        for (var bi = 0; bi < this.gp.buttons.length; bi++)
        {
            state += bi + " " + this.gp.buttons[bi].pressed + " ";
        }
        console.log(state);
    }
    AnyPressed()
    {
        for (var bi = 0; bi < this.gp.buttons.length; bi++)
        {
            if (this.gp.buttons[bi].pressed)
            {
                return bi;
            }
        }
        return -1;
    }
    isBoundToPlayer(players)
    {
        for (var pi = 0; pi < players.length; pi++)
        {
            let p = players[pi];
            if (p == this.boundPlayer)
            {
                return true;
            }

        }
        return false;
    }

}

//class BoundAxis
//{
//    constructor(name)
//    {
//        this.axis = null;
//        this.axisI = null;
//        this.invert = false;
//        this.name = name;
//    }
//}
class BoundKey
{
    constructor(name)
    {
        this.button = null;
        this.name = name;
    }
}