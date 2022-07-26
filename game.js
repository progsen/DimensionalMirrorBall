let game;
let startScreen = 0;
let setupScreen = 1
let ingameScreen = 2;
let winScreen = 3;
let controllerSetupScreen = 4;


function Overlaps(a, b)
{
    if (a.x < b.x + b.w && a.x + a.w > b.x &&
        a.y < b.y + b.h && a.y + a.h > b.y)
    {
        return true;
    }
    return false;
}

function entryPoint()
{
    game = new Game();
}

function loadAudioBuffer(url, audioContext, completed)
{
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // Decode asynchronously
    request.onload = function ()
    {
        var onerror = function () { console.log("error " + url) };
        audioContext.decodeAudioData(request.response, function (buffer)
        {
            completed(buffer);
        }, onerror);
    }
    request.send();
}
function playSound(buffer, audioContext)
{
    var source = audioContext.createBufferSource(); // creates a sound source
    source.buffer = buffer;                    // tell the source which sound to play
    source.connect(audioContext.destination);       // connect the source to the context's destination (the speakers)
    source.start(0);                           // play the source now
    // note: on older systems, may have to use deprecated noteOn(time);
    return audioContext.currentTime;
}

class Game
{
    constructor()
    {
        this.gamePads = [];
        this.state = startScreen;
        this.canvas = document.getElementById("canvas");
        this.g = canvas.getContext('2d');
        let scope = this;
        window.addEventListener("keydown", function (e)
        {
            scope.keydown(e);
        });
        window.addEventListener("keyup", function (e)
        {
            scope.keyup(e);
        });
        this.canvas.addEventListener("keydown", function (e)
        {
            scope.keydown(e);
        });
        this.canvas.addEventListener("keyup", function (e)
        {
            scope.keyup(e);
        });

        this.canvas.addEventListener("click", function (e)
        {
            scope.click(e);
        });

        this.players = [];
        this.bullets = [];

        this.canvas.width = 800;
        this.canvas.height = 400;
        this.g.width = canvas.width;
        this.g.height = canvas.height;


        this.screen = new Rect(0, 0, this.canvas.width, this.canvas.height);
        this.setupMatchUI = [new UIClickable(this.screen.w - 100, this.screen.h - 50, 100, 50, null, "gray", "Controllers", function () { scope.GotoControllerSetup(); })];
        this.winUI = [new UIClickable(this.screen.w - 100, this.screen.h - 50, 100, 50, null, "gray", "Controllers", function () { scope.ResetGame(); })];
        this.startUI = [new UIClickable(this.screen.W2(), this.screen.H2() + 100, 100, 50, null, "gray", "Start", function () { scope.GotoMatchSetup(); })];

        this.LoadLevel();

        //this.platforms = [new Platform(0, 100,16,8, platform[3], platform)];
        console.log(this.canvas.width + " " + this.canvas.height);

        this.SetupAudio();

        this.controllerSetupLogic = new ControllerSetupLogic(this);
        this.keyboard = new KeyboardGamepad();

        //if (this.keyboard.connected == false)
        //{
        let pad = new PlayerGamePad(this.keyboard);
        this.gamePads.push(pad);
        this.keyboard.connected = true;
        this.controllerSetupLogic.AddControllerToUi(pad);
        //}
        this.renderer = new Renderer(this.g, this);


        this.renderer.sprites.onload = function (e)
        {
            setInterval(function ()
            {
                scope.logic();
            }, 33);
        }
        this.renderer.sprites.src = 'sprites.png?' + Math.random();

    }
    GotoMatchSetup()
    {
        this.state = setupScreen;

    }
    GotoControllerSetup()
    {
        //let knowncontrollers = Object.keys(localStorage);
        //console.log()
        this.state = controllerSetupScreen;
    }
    click(e)
    {
        console.log(e + " " + this.canvas.offsetLeft + " " + this.canvas.offsetTop);

        switch (this.state)
        {
            case startScreen: this.CheckUiClick(this.startUI, e); break;
            case setupScreen: this.CheckUiClick(this.setupMatchUI, e); break;
            //case ingameScreen: this.CheckUiClick(this.setupControllerUI,e);break;
            case winScreen: this.CheckUiClick(this.winUI, e); break;
            case controllerSetupScreen:
                this.CheckUiClick(this.controllerSetupLogic.setupControllerUI, e);
                this.CheckUiClick(this.controllerSetupLogic.setupControllerDynaUI, e);
                break;

        }

    }
    CheckUiClick(ui, e)
    {
        for (var i = 0; i < ui.length; i++)
        {
            ui[i].TryHit(e);
        }
    }
    keydown(e)
    {
        this.keyboard.setKeyState(true, e.which);
        e.cancelBubble = true;
    }
    keyup(e)
    {
        this.keyboard.setKeyState(false, e.which);
        e.cancelBubble = true;
    }

    ResetGame()
    {

        this.ResetPlayers();
        this.state = setupScreen;
    }
    StartMatch()
    {
        this.winner = "";
        this.readycount =3;
        this.bullets = [];
        this.teamScore = [0, 0];
        for (var i = 0; i < this.players.length; i++)
        {
            playSound(this.spawnBuffer, this.audioContext);
            this.players[i].SpawnIn(this.spawnPointsTeam);

        }
        this.state = ingameScreen;
    }
    LoadLevel()
    {
        let platform = spriteSheet["icons"]["platform"]


        this.borders = [
            new Platform(-160, -1000, 160, this.canvas.height + 2000, platform),
            new Platform(this.canvas.width, -1000, 160, this.canvas.height + 2000, platform)
        ];

        this.alwaysPlatforms = [
            new Platform(0, (this.canvas.height / 2) - (platform[3] / 2), this.canvas.width, platform[3], platform),
        ];

        this.platforms = [];

        for (var i = 0; i < this.borders.length; i++)
        {
            this.platforms.push(this.borders[i]);
        }

        for (var i = 0; i < this.alwaysPlatforms.length; i++)
        {
            this.platforms.push(this.alwaysPlatforms[i]);
        }

        this.spawnPointsTeam = [[], []];


        for (var i = 0; i < this.canvas.width; i += 100)
        {
            this.spawnPointsTeam[0].push(new Rect(i, this.alwaysPlatforms[0].r.y - 64, 1, 1));
            this.spawnPointsTeam[1].push(new Rect(i, this.alwaysPlatforms[0].r.Bottom(), 1, 1));
        }

        this.MakeMirroredPlatforms(0, 128, 100, platform[3], platform)

        this.MakeMirroredPlatforms(100, 64, 100, platform[3], platform)
        this.MakeMirroredPlatforms(600, 64, 100, platform[3], platform)
        this.MakeMirroredPlatforms(700, 128, 100, platform[3], platform)
    }

    MakeMirroredPlatforms(x, y, w, h, platform)
    {

        let ptop = new Platform(x, this.alwaysPlatforms[0].r.y - y - platform[3], w, h, platform);
        let pbottom = new Platform(x, this.alwaysPlatforms[0].r.Bottom() + y, w, h, platform);

        this.platforms.push(ptop);
        this.platforms.push(pbottom);

        this.spawnPointsTeam[0].push(new Rect(x, ptop.r.y - 64, 1, 1));
        this.spawnPointsTeam[1].push(new Rect(x, pbottom.r.Bottom(), 1, 1));
    }

    SetupAudio()
    {
        try
        {
            // Fix up for prefixing
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            this.musicContext = new AudioContext();
            let scope = this;

            loadAudioBuffer("hit.mp3", this.audioContext, function (buffer) { scope.hitBuffer = buffer });
            loadAudioBuffer("jump.mp3", this.audioContext, function (buffer) { scope.jumpBuffer = buffer });
            loadAudioBuffer("fire.mp3", this.audioContext, function (buffer) { scope.fireBuffer = buffer });
            loadAudioBuffer("spawn.mp3", this.audioContext, function (buffer) { scope.spawnBuffer = buffer });
            loadAudioBuffer("HoliznaCC0 - Final Level.mp3", this.audioContext, function (buffer)
            {
                scope.musicBuffer = buffer;
                playSound(scope.musicBuffer, scope.musicContext);
            });
        }
        catch (e)
        {
            alert('Web Audio API is not supported in this browser');
        }
    }

    connectNewPlayers()
    {

        for (var i = 0; i < this.gamePads.length; i++)
        {
            if (this.gamePads[i].isBoundToPlayer(this.players) == false)
            {
                let gp = this.gamePads[i].gp;
                let buttonI = this.gamePads[i].AnyPressed();
                if (buttonI != -1)
                {
                    this.gamePads[i].setupbuttontimeout = buttonI;
                    let p = new Player(this.gamePads[i]);
                    this.InitPlayer(p);

                    console.log("added player for " + gp.index + " " + this.players.length);
                    this.players.push(p);
                }
            }
        }
    }
    InitPlayer(p)
    {

        p.vY = this.players.length % 2 ? 1 : -1;

        p.SetPlayerType();

        p.SpawnIn(this.spawnPointsTeam);
    }
    ResetPlayers()
    {
        let copy = [];
        for (var i = 0; i < this.players.length; i++)
        {
            copy.push(this.players[i]);
        }

        this.players = [];
        for (var i = 0; i < copy.length; i++)
        {
            let oldP = copy[i];
            let p = new Player(oldP.gamepad);
            this.InitPlayer(p);
            console.log("added player for " + oldP.gamepad.index + " " + this.players.length);
            this.players.push(p);
        }
    }
    setupLogic()
    {
        for (var i = 0; i < this.players.length; i++)
        {
            let gp = this.players[i].gamepad;
            if (gp != null)
            {
                if (gp.IsPressed(gp.ok))
                {
                    this.players[i].ready = true;
                    if (this.AllAreReady())
                    {
                        this.StartMatch();
                    }
                }
            }
        }

        this.connectNewPlayers();
    }
    AllAreReady()
    {
        for (var i = 0; i < this.players.length; i++)
        {
            if (this.players[i].ready == false)
            {
                return false;
            }

        }
        return this.players.length >= 2;
    }
    acceleratePlayer(p, gp, frametime)
    {
        if (gp.IsPressed(gp.right))
        {
            p.accelhorizontal(1, frametime);
        }
        else if (gp.IsPressed(gp.left))
        {
            p.accelhorizontal(-1, frametime);
        }
        else
        {
            p.decelHorizontal(frametime);
        }

        if (gp.IsPressed(gp.jump) == false && p.IsJumping())
        {
            p.canJump = false;
        }
        if (gp.IsPressed(gp.jump) && p.canJump == true)
        {
            if (p.animation != "jump")
            {

                playSound(this.jumpBuffer, this.audioContext);
                p.v[1] = 0;
            }
            p.animation = "jump";
            p.syncAnim();
            //console.log("accelJumpVerticalg");
            p.accelJumpVertical(frametime);
        }
        else
        {
            //console.log("accelVertical " + gp.IsPressed(gp.jump) + " " + p.canJump);
            p.accelVertical(frametime);

        }
    }
    handlePlayerCollisions(p, gp, frametime)
    {
        this.acceleratePlayer(p, gp, frametime);
        p.setNextPosH();
        let hitsH = p.CollectHits(this.borders);
        if (hitsH.length > 0)
        {
            if (p.v[0] > 0)
            {
                p.r.x = hitsH[0].r.x - p.r.w;
            }
            else
            {
                p.r.x = hitsH[0].r.Right();
            }
            p.v[0] = 0;
        }
        else
        {
            p.Commit();
        }

        p.setNextPosV();
        let hitsV = p.CollectHits(this.platforms);
        //if (hitsV.length > 0)
        //{
        //    if (p.IsJumping() == false)
        //    {
        //        p.canJump = true;

        //        p.animation = "stand";
        //        p.syncAnim();
        //    }
        //    else
        //    {
        //        p.canJump = false;
        //    }
        //    if (p.v[1] > 0)//falling
        //    {

        //        p.r.y = hitsV[0].r.y - p.r.h;
        //    }
        //    else//jumping
        //    {
        //        p.r.y = hitsV[0].r.Bottom();
        //    }
        //    p.v[1] = 0;
        //}
        //else
        //{
        //    console.log("p jumping " + p.vY + " " + p.v[1] + " " + p.IsJumping());
        //    p.Commit();
        //}


        if (p.IsJumping() == false)//falling
        {
            p.animation = "stand";
            p.syncAnim();
            let lowerplatforms = p.CollectBelow(this.platforms)
            let hitsV = p.CollectHits(lowerplatforms);
            if (hitsV.length > 0)
            {
                if (p.vY == 1)
                {
                    p.r.y = hitsV[0].r.y - p.r.h;
                }
                else
                {
                    p.r.y = hitsV[0].r.Bottom();
                }
                p.canJump = true;
                p.v[1] = 0;
            }
            else
            {
                p.Commit();
            }
        }
        else//jumping
        {
            p.Commit();
        }
    }

    ingameLogic()
    {
        //console.log("ingameLogic");
        let frametime = 33 / 1000.0;
        if (this.readycount > 0)
        {
            this.readycount -= frametime;
            return;
        }
        for (var i = 0; i < this.players.length; i++)
        {
            let p = this.players[i];

            if (p.animation == "hit")
            {
                p.deathTimeLogic(this.spawnPointsTeam, frametime);
                continue;
            }
            if (p.knockedOut)
            {
                continue;
            }
            let gp = p.gamepad;
            this.handlePlayerCollisions(p, gp, frametime);
            if (gp.IsPressed(gp.attack) && p.bulletCool <= 0)
            {
                p.bulletCharge += frametime;
                if (p.bulletCharge >= p.maxbulletCharge)
                {
                    p.bulletCharge = p.maxbulletCharge;
                }
                if (p.bulletCharge >= 1)
                {
                    p.SetChargeHidden ( false);
                    p.ChargeLogic(frametime);
                }
            }

            if (gp.IsPressed(gp.attack) == false && p.bulletCharge > 0)
            {
                p.SetChargeHidden ( true);
                p.ChargeLogic(frametime);
                this.SpawnBullet(p);
            }
            if (p.bulletCool > 0)
            {
                p.bulletCool -= frametime;
            }
        }

        for (var i = this.bullets.length - 1; i >= 0; i--)
        {
            let b = this.bullets[i];
            b.accelVertical(frametime);
            b.r.y += b.v[1];

            let hits = b.CollectHits(this.borders);
            if (hits > 0)
            {
                this.bullets.splice(i, 1);
                break;
            }

            let playerhits = b.CollectHits(this.players);

            for (var bi = playerhits.length - 1; bi >= 0; bi--)
            {
                let p = playerhits[bi];
                if (p.vY != b.team)
                {
                    if (p.animation != "hit")
                    {
                        b.owner.score++;
                        this.bullets.splice(i, 1);
                        p.Died();
                        playSound(this.hitBuffer, this.audioContext);
                        this.CheckWin();
                        break;
                    }
                }
            }
        }
    }
    CheckWin()
    {
        let team1 = 0;
        let team2 = 0;
        for (var i = 0; i < this.players.length; i++)
        {
            let p = this.players[i];
            console.log(p.vY + " " + p.stock);
            if (p.stock != 0)
            {
                if (p.vY == -1)
                {
                    team2++;
                }
                else
                {
                    team1++;
                }
            }
        }
        if (team1 == 0 || team2 == 0)
        {
            this.winner = team1 == 0 ? "team2" : "team1";

            this.state = winScreen;
        }
    }
    SpawnBullet(p)
    {
        playSound(this.fireBuffer, this.audioContext);
        let type = (1 + Math.floor(p.bulletCharge));
        let size = 16;
        if (type == 2)
        {
            size = 32;
        }
        if (type == 3)
        {
            size = 64;
        }
        console.log("spawnbullet" + size + " " + type);
        let sprite = size + p.playertype; console.log(sprite);
        let bullet = new Bullet(p.r.CX() - (size / 2), p.r.CY() - (size / 2), size, size, spriteSheet["bullet"][sprite], p.vY, p.bulletCharge);
        bullet.owner = p;
        this.bullets.push(bullet);
        p.bulletCool = 0.4;
        p.bulletCharge = 0;

    }
    winLogic()
    {

    }
    startLogic()
    {

    }
    logic()
    {
        //edge hack because it doesn't update the damn controller state unless you get them via navigator.getgamepads
        for (var i = 0; i < this.players.length; i++)
        {
            this.controllerSetupLogic.GetGamepadUpdateBecauseEdgeSUCKS(this.players[i].gamepad);
        }
        switch (this.state)
        {
            case startScreen: this.startLogic(); this.renderer.renderStart(); break;
            case setupScreen: this.setupLogic(); this.renderer.renderSetup(); break;
            case ingameScreen: this.ingameLogic(); this.renderer.renderFrame(); break;
            case winScreen: this.winLogic(); this.renderer.renderWin(); break;
            case controllerSetupScreen: this.controllerSetupLogic.Logic(); this.renderer.renderControllerSetup(); break;

        }
    }
}

