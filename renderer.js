
class Renderer
{
    constructor(g, game)
    {
        this.game = game;
        this.g = g;
        this.sprites = new Image();
        this.bg1 = new Platform(0, 0, 800, 200, spriteSheet["bg"]);
        this.bg2 = new Platform(0, 200, 800, 200, spriteSheet["bg"]);
        this.font = "12px Comic Sans MS";
        this.bigfont = "30px Comic Sans MS";
    }
    renderControllerSetup()
    {
        let g = this.g;
        let sprites = this.sprites;

        this.renderBg(g);
        g.font = this.font;
        g.fillStyle = "red";


        this.renderUi(g, this.game.controllerSetupLogic.setupControllerUI);
        this.renderUi(g, this.game.controllerSetupLogic.setupControllerDynaUI);
    }
    renderSetup()
    {
        let g = this.g;
        let sprites = this.sprites;

        this.renderBg(g);



        g.font = this.font;
        g.fillStyle = "red";
        let players = this.game.players;
        let x = 30;
        let close = spriteSheet["icons"]["playerframeclose"];
        for (var i = 0; i < 4; i++)
        {
            let use = close;
            if (i < players.length)
            {
                use = spriteSheet["icons"][players[i].playertype]["playerframeopen"];
                if (players[i].ready)
                {
                    use = spriteSheet["icons"][players[i].playertype]["playerframeready"];
                }
            }
            g.drawImage(sprites, use[0], use[1], use[2], use[3], x, 100, use[2], use[3]);


            if (i < players.length && players[i].ready)
            {
                let text = "Ready!";

                let m = g.measureText(text);
                g.fillText(text, (x + (use[2] / 2)) - (m.width / 2), 100 + 30);

            }
            if (i < players.length)
            {
                let p = players[i];
                let gp = p.gamepad;
                if (gp.setupComplete == false)
                {
                    g.fillText("Gamepad not configured", x, 70);
                    g.fillText(gp.gp.id, x, 80);
                    g.fillText("Click the controllers button to config", x, 90);
                    //let msg = gp.buttons[gp.setupI].name;
                    ////g.textAlign = "center";
                    //g.fillText("press button for " + msg, x, 50);
                }
            }
            x += use[2] + 60;

        }

        this.renderUi(g, this.game.setupMatchUI);
    }
    renderStart()
    {
        let g = this.g;
        let sprites = this.sprites;
        let use = spriteSheet["title"];
        g.drawImage(sprites, use[0], use[1], use[2], use[3], 0, 0, use[2], use[3]);
        g.fillStyle = "yellow";
        g.font = this.bigfont;
        g.fillText("DimensionalMirrorBall", 10, 50);

        this.renderUi(g, this.game.startUI);

    }
    renderUi(g, setupMatchUI)
    {
        for (var i = 0; i < setupMatchUI.length; i++)
        {
            let ui = setupMatchUI[i];
            if (ui.color != null)
            {
                g.font = ui.font;
                g.fillStyle = ui.color;
                g.fillRect(ui.r.x, ui.r.y, ui.r.w, ui.r.h);
                g.fillStyle = "white";
                let m = g.measureText(ui.text);
                g.fillText(ui.text, ui.r.CX() - (m.width / 2), ui.r.CY() - (m.actualBoundingBoxAscent / 2));
            }

        }
    }
    renderBg(g)
    {

        let bg1 = this.bg1;
        let bg2 = this.bg2;
        g.drawImage(this.sprites, bg1.sprite[0], bg1.sprite[1], bg1.sprite[2], bg1.sprite[3], bg1.r.x, bg1.r.y, bg1.r.w, bg1.r.h);

        g.setTransform(-1, 0, 0, -1, bg2.r.x + bg2.r.W2(), bg2.r.y + bg2.r.H2());
        g.drawImage(this.sprites, bg2.sprite[0], bg2.sprite[1], bg2.sprite[2], bg2.sprite[3], -bg2.r.W2(), -bg2.r.H2(), bg2.r.w, bg2.r.h);
        g.setTransform(1, 0, 0, 1, 0, 0);

    }
    renderFrame()
    {
        let g = this.g;
        let sprites = this.sprites;

        //g.fillStyle = "#555555";
        //g.fillRect(0, 0, canvas.width, canvas.height)


        g.fillStyle = "white";


        g.font = this.font;
        //g.fillRect()

        this.renderBg(g);
        let platforms = this.game.platforms;
        for (var i = 0; i < platforms.length; i++)
        {
            let p = platforms[i];
            g.drawImage(sprites, p.sprite[0], p.sprite[1], p.sprite[2], p.sprite[3], p.r.x, p.r.y, p.r.w, p.r.h);
            //g.fillRect(p.r.x, p.r.y,100,100);

        }


        g.font = this.font;
        let players = this.game.players;
        for (var i = 0; i < players.length; i++)
        {
            let p = players[i];
            if (p.knockedOut)
            {
                continue;
            }
            g.setTransform(p.v[0] > 0 ? 1 : -1, 0, 0, p.vY, p.r.x + p.r.W2(), p.r.y + p.r.H2());
            //g.drawImage(sprites, p.sprite[0], p.sprite[1], p.sprite[2], p.sprite[3], p.r.x, p.r.y, p.r.w, p.r.h);
            g.drawImage(sprites, p.sprite[0], p.sprite[1], p.sprite[2], p.sprite[3], -p.r.W2(), -p.r.H2(), p.r.w, p.r.h);
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.fillText("P" + (i + 1), p.r.x, p.r.y);
            for (var ci = 0; ci < p.charge.length; ci++)
            {
                let c = p.charge[ci];
                if (c.hidden == false)
                {
                    g.drawImage(sprites, c.sprite[0], c.sprite[1], c.sprite[2], c.sprite[3], c.r.x,c.r.y, c.r.w, c.r.h);

                }
            }
            //g.scale(1, 1);
        }

        for (var i = 0; i < this.game.bullets.length; i++)
        {
            let p = this.game.bullets[i];
            g.drawImage(sprites, p.sprite[0], p.sprite[1], p.sprite[2], p.sprite[3], p.r.x, p.r.y, p.r.w, p.r.h);
        }

        if (this.game.readycount > 0)
        {
            g.font = this.bigfont;

            let text = "READY? " + Math.ceil(this.game.readycount);

            let m = g.measureText(text);
            g.fillText(text, this.game.screen.W2() - (m.width / 2), this.game.screen.H2());

        }
        let x = 30;
        g.font = this.font;
        for (var i = 0; i < players.length; i++)
        {
            let p = players[i];
            g.fillText("P" + (i + 1), x, 20);
            x += 30;
            let stock = spriteSheet["icons"][players[i].playertype]["stock"];
            for (var s = 0; s < p.stock; s++)
            {
                g.drawImage(sprites, stock[0], stock[1], stock[2], stock[3], x, 10, stock[2], stock[3]);
                x += stock[2];

            }
            x += 30;
        }

    }
    renderWin()
    {

        let g = this.g;
        let sprites = this.sprites;



        g.fillStyle = "white";


        g.font = this.font;

        this.renderBg(g);
        g.font = this.bigfont;

        let playertype = this.game.winner == "team1" ? "player" : "player2";

        let use = spriteSheet["icons"][playertype]["playerframeopen"];
        g.drawImage(sprites, use[0], use[1], use[2], use[3], this.game.screen.W2() - (use[2] / 2), 10, use[2], use[3]);

        let text = "Winner " + this.game.winner;

        let m = g.measureText(text);
        g.fillText(text, this.game.screen.W2() - (m.width / 2), 10 + use[3] + 30);
        this.renderUi(g, this.game.winUI);
    }
}