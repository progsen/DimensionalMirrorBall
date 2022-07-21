

let spriteSheet = {
    "player": {
        "stand": [0, 33, 64, 64],
        "jump": [65, 33, 64, 64],
        "hit": [129, 33, 64, 64],
    },
    "player2": {
        "stand": [0, 97, 64, 64],
        "jump": [65, 97, 64, 64],
        "hit": [129, 97, 64, 64],
    },
    "bullet": {
        "player": [47, 0, 16, 16],
        "player2": [87, 0, 16, 16],
    },
    "bg": [0, 200, 800, 200],
    "icons": {
        "thinplatform": [0, 25, 16, 3],
        "platform": [22, 25, 16, 8],
        "playerframeclose": [664, 0, 140, 200],
        "player": {
            "playerframeopen": [523, 0, 140, 200],
            "playerframeready": [383, 0, 140, 200],
            "stock": [0, 0, 16, 16],
        },
        "player2": {
            "playerframeopen": [950, 0, 140, 200],
            "playerframeready": [811, 0, 140, 200],
            "stock": [70, 0, 16, 16],
        },


    }
}

class Rect
{
    constructor(x, y, w, h)
    {
        this.x = 0.0 + x;
        this.y = 0.0 + y;
        this.w = 0.0 + w;
        this.h = 0.0 + h;
    }
    CX()
    {
        return this.x + this.W2();
    } CY()
    {
        return this.y + this.H2();
    }
    W2()
    {
        return this.w / 2;
    }
    H2()
    {
        return this.h / 2;
    }
    Right()
    {
        return this.x + this.w;
    }
    Bottom()
    {
        return this.y + this.h;
    }
    Contains(x, y)
    {
        return x >= this.x && x <= this.Right() && y >= this.y && y <= this.Bottom()
    }
}


class Player
{

    constructor(gamepad)
    {
        this.ready = false;


        this.gamepad = gamepad;
        this.gamepad.boundPlayer = this;
        this.r = new Rect(0, 0, 64, 64);
        this.nextR = new Rect(0, 0, 64, 64);
        this.v = [0.0, 0.0];
        this.speed = 20;
        this.maxSpeed = 8.0;
        this.speedY = 20;
        this.canJump = false;
        this.jumpSpeed = 30;
        this.maxJumpSpeed = 8.0;
        this.maxYSpeed = 30;
        this.vY = 1;
        this.playertype = "player";
        this.score = 0;
        this.stock = 3;
        this.deaths = 0;
        this.bulletCool = 0;
        this.bulletCharge = 0;
        this.maxbulletCharge = 3;
        this.animation = "stand";
        this.deathTimer = 0;
        this.syncAnim();
        this.knockedOut = false;
    }
    Died()
    {
        this.deaths++;
        this.deathTimer = 0.5;
        this.stock--;
        if (this.stock <= 0)
        {
            this.knockedOut = true;
        }
        this.animation = "hit";
        this.syncAnim();
        console.log("died" + this.stock);
    }
    SpawnIn(spawnPointsTeam)
    {


        let options = spawnPointsTeam[0];
        if (this.vY == -1)
        {
            options = spawnPointsTeam[1];
        }
        let spawn = options[Math.floor(Math.random() * options.length)];
        this.r.x = spawn.x;
        this.r.y = spawn.y;
    }
    deathTimeLogic(spawnPoints, frametime)
    {
        this.deathTimer -= frametime;
        if (this.deathTimer <= 0)
        {
            this.animation = "stand";
            this.SpawnIn(spawnPoints);
        }
    }
    syncAnim()
    {

        this.sprite = spriteSheet[this.playertype][this.animation];
    }
    setNextPosV()
    {

        this.nextR.x = this.r.x;
        this.nextR.y = this.r.y + this.v[1];

    }
    setNextPosH()
    {

        this.nextR.y = this.r.y;
        this.nextR.x = this.r.x + this.v[0];

    }

    CollectHits(platforms)
    {
        let hits = [];
        for (var pi = 0; pi < platforms.length; pi++)
        {
            if (Overlaps(platforms[pi].r, this.nextR))
            {
                hits.push(platforms[pi]);
            }
        }
        return hits;
    }
    Commit()
    {

        this.r.x = this.nextR.x;
        this.r.y = this.nextR.y;
    }
    accelJumpVertical(frametime)
    {

        this.v[1] += -this.vY * this.jumpSpeed * frametime;
        if (this.vY == 1 && this.v[1] < -this.vY * this.maxJumpSpeed)
        {
            this.v[1] = -this.vY * this.maxJumpSpeed;
            this.canJump = false;
        }
        if (this.vY == -1 && this.v[1] > -this.vY * this.maxJumpSpeed)
        {
            this.v[1] = -this.vY * this.maxJumpSpeed;
            this.canJump = false;
        }
    }
    IsJumping()
    {
        if (this.vY < 0 && this.v[1] > 0)
        {
            return true;
        }
        if (this.vY > 0 && this.v[1] < 0)
        {
            return true;
        }
        return false;
    }
    accelVertical(frametime)
    {
        this.v[1] += this.vY * this.speedY * frametime;

        if (this.v[1] > this.maxYSpeed)
        {
            this.v[1] = this.maxYSpeed;
        }
        else if (this.v[1] < -this.maxYSpeed)
        {
            this.v[1] = -this.maxYSpeed;
        }
    }
    accelhorizontal(dir, frametime)
    {
        this.v[0] += dir * this.speed * frametime;

        if (this.v[0] > this.maxSpeed)
        {
            this.v[0] = this.maxSpeed;
        }
        else if (this.v[0] < -this.maxSpeed)
        {
            this.v[0] = -this.maxSpeed;
        }
    }
    decelHorizontal(frametime)
    {
        if (Math.abs(this.v[0]) < 1)
        {
            this.v[0] = 0;
        }
        else if (this.v[0] > 0)
        {
            this.v[0] -= this.speed * frametime;

        }
        else if (this.v[0] < 0)
        {
            this.v[0] += this.speed * frametime;

        }
    }
}
class UIClickable
{
    constructor(x, y, w, h, sprite, color, text, onclick)
    {
        this.sprite = sprite;
        this.font = "12px Comic Sans MS";
        this.text = text;
        this.color = color;
        this.onclick = onclick;
        this.r = new Rect(x, y, w, h);
    }

    TryHit(clickEvent)
    {
        let x = clickEvent.offsetX;
        let y = clickEvent.offsetY;
        if (this.r.Contains(x, y))
        {
            this.onclick();
        }
    }
}
class Platform
{
    constructor(x, y, w, h, sprite)
    {
        this.sprite = sprite;
        this.r = new Rect(x, y, w, h);
    }
}
class Bullet
{
    constructor(x, y, w, h, sprite, vY, charge)
    {
        this.team = vY;
        this.vY = vY;
        this.v = [0, 0];
        this.sprite = sprite;
        this.maxYSpeed = 30;
        this.r = new Rect(x, y, w, h);
        this.speedY = 20;
        this.charge = charge * 0.66;
    }
    accelVertical(frametime)
    {
        if (this.charge > 0)
        {
            this.charge -= frametime;
            this.v[1] -= this.vY * this.speedY * frametime;
        }
        else
        {
            this.v[1] += this.vY * this.speedY * frametime;
        }

        if (this.v[1] > this.maxYSpeed)
        {
            this.v[1] = this.maxYSpeed;
        }
        else if (this.v[1] < -this.maxYSpeed)
        {
            this.v[1] = -this.maxYSpeed;
        }
    }

    CollectHits(platforms)
    {
        let hits = [];
        for (var pi = 0; pi < platforms.length; pi++)
        {
            if (Overlaps(platforms[pi].r, this.r))
            {
                hits.push(platforms[pi]);
            }
        }
        return hits;
    }
}
