var tileHeight = 82;
var tileWidth = 101;
var upMovement = -1 * tileHeight;
var leftMovement = -1 * tileWidth;
var score = 0;
var lives = 3;
var laneSpeed = [225, 200, 175, 150, 125, 100];
var speedSlider;
var ouchSound = new Audio();
var splashSound = new Audio();
var marioStarSound = new Audio();
var heartSound = new Audio();
var shouldPlaySounds = true;
var spriteDictionary = {
    boy:"images/char-boy.png",
    catGirl:"images/char-cat-girl.png",
    "hornGirl":"images/char-horn-girl.png",
    "pinkGirl":"images/char-pink-girl.png",
    "princess":"images/char-princess-girl.png",
};

// Inimigos que o jogador deve desviar
class Enemy{
    constructor(lane){

        this.speedBase = laneSpeed[lane-1];
        this.speed = this.speedBase;
        this.x = 0;
        
        
        this.y = lane * tileHeight - 20;

        this.sprite = 'images/enemy-bug.png';
    }
    
    update(dt){
        this.x += (this.speed * dt);
        if(this.x > 750){
            this.x = -10;
        }
    }
    
    updateSpeed(speedModifier){
        this.speed = this.speedBase + speedModifier;
    }
    
    render(){
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

class Player {
    constructor(characterType){
        this.x = 303;
        this.y = 560;
        this.Ymovement = 0;
        this.Xmovement = 0;
        this.inWater = false;
        this.isHit = false;
        this.isGettingStar = false;
        this.halfWidth = 20;
        this.halfHeight = 20;
        this.sprite = spriteDictionary[characterType];
        this.starComingIn = false;
        this.fallingStar = null;
        this.hasSpeedBoost = false;
    }
    
    render(){
        
        if(this.hasSpeedBoost){
            ctx.drawImage(Resources.get('images/Selector.png'), this.x, this.y - 20);
        }
        
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y );
        
        if(this.inWater)
            ctx.drawImage(Resources.get('images/water-splash2.png'), this.x, this.y - 15);
        
        if(this.isHit)
            ctx.drawImage(Resources.get('images/blast.png'), this.x + 5, this.y +40);
        
        if(this.fallingStar !== null){
            this.fallingStar.render();
        }
    }
    
    update(dt){
        if(this.fallingStar != null){
            this.fallingStar.update(dt);
            if(this.fallingStar.currentY > this.y -20 ){
                this.fallingStar = null;
                star.visible = false;
                this.hasSpeedBoost = true;
                speedSlider.val(-60);
                updateSpeedModifier(-60);
                $('#box').toggleClass('starTimer');
                setTimeout(() => {
                    speedSlider.val(60);
                    updateSpeedModifier(60);    
                    this.hasSpeedBoost = false;
                    marioStarSound.pause();
                    marioStarSound.currentTime = 0;
                    $('#box').removeClass('starTimer');
                },5000);
            }
        }
        
        if(this.Xmovement !== 0){
            this.x += this.Xmovement; 
            this.Xmovement = 0;
        }
        
        if(this.Ymovement !== 0){
            this.y += this.Ymovement;
            this.Ymovement = 0;
            
            // se vencerem o jogo  
            if(this.y < 50 && !this.inWater){
                incrementScore();
                this.inWater = true;
                if(shouldPlaySounds)
                    splashSound.play();
                setTimeout(() => {
                    this.reset();
                } , 500);
            }
        }
        
        // colisões
        for(const enemy of allEnemies){
            const differenceX = Math.abs(this.x - enemy.x);
            const differenceY = Math.abs(this.y - enemy.y);
            if(differenceX < 70 && differenceY < 20 && !this.isHit){
                
                lives--;
                $('#lives').html(lives); 
                this.isHit = true;
                if(shouldPlaySounds)
                    ouchSound.play();
                
                if(lives === 0){
                     swal({
                        title: 'Game Over',
                        text: 'Better Luck Next Time',
                        type: 'error',
                        confirmButtonText: 'Next Game'
                    },function(){
                        setupNewGame();    
                    });    
                }else{
                    setTimeout(() =>{
                        this.reset();
                    },500);
                }
            }
        }
        
        
        const diffX = Math.abs(this.x - gem.x);
        const diffY = Math.abs(this.y - gem.y);
        if(diffX < 70 && diffY < 20){
            incrementScore();
            gem = new Gem();
        }
        
        // renderiza o coração
        if(heart.visible){
            const heartDiffX = Math.abs(this.x - heart.x);
            const heartDiffY = Math.abs(this.y - heart.y);
            if(heartDiffX < 70 && heartDiffY < 20 && heart.visible && this.fallingStar === null){
                heart.visible = false;
                heartSound.play();
                lives++;
                $('#lives').html(lives);
            }    
        }
        
        if(star.visible){
            const starDiffX = Math.abs(this.x - star.x);
            const starDiffY = Math.abs(this.y - star.y);
            if(starDiffX < 70 && starDiffY < 20 && star.visible && this.fallingStar === null){
                star.visible = false;
                if(shouldPlaySounds)
                    marioStarSound.play();
                this.fallingStar = new FallingStar(this.x, this.y);
            }    
        }
    }
    
    handleInput(direction){
        switch(direction){
            case 'left':
                if(this.x > 0) 
                    this.Xmovement = leftMovement;    
                break;
            case 'up':
                if(this.y > 0)
                    this.Ymovement = upMovement;
                break;
            case 'right':
                if(this.x < 640) 
                    this.Xmovement = tileWidth;
                break;
            case 'down':
                if(this.y < 555)
                    this.Ymovement = tileHeight;
                break;
        }
    }
    
    reset(){
        this.x = 303;
        this.y = 560;
        this.inWater = false;
        this.isHit = false;
        this.hasSpeedBoost = false;
        marioStarSound.pause();
        marioStarSound.currentTime = 0;
        heart = new Heart();
        star = new Star();
        speedSlider.val(60);
        updateSpeedModifier(60);
        $('#box').removeClass('starTimer');
    }
}

function incrementScore(){
    score++;
    $('#score').html(score);
    if(score === 5){
        swal({
			title: 'You win!',
			text: 'You got 5!',
			type: 'success',
			confirmButtonText: 'Next Game'
		},function(){
            setupNewGame();    
        });    
    }    
}

function setupNewGame(){
    score = 0;
    $('#score').html(score);
    lives = 3;
    $('#lives').html(lives);
    player.reset();
    allEnemies = [new Enemy(1), new Enemy(2), new Enemy(3), new Enemy(4), new Enemy(5), new Enemy(6)];
    heart = new Heart();
}

const gemSprites = [ 'images/Gem Blue.png', 
                     'images/Gem Green.png',
                     'images/Gem Orange.png'];

class Gem{
    constructor(){
        const column = Math.floor(Math.random() * 5);
        this.x = column * tileWidth;
        
        const row = Math.floor(Math.random() * 3) + 1;
        this.y = row * tileHeight - 25;
        
        this.sprite = gemSprites[0];
    }
    
    render(){
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

class Heart{
    constructor(){
        const column = Math.floor(Math.random() * 8);
        this.x = column * tileWidth;
        
        const row = Math.floor(Math.random() * 4) + 2;
        this.y = row * tileHeight - 15;
        
        this.sprite = 'images/Heart.png';
        this.visible = true;
    }
    
    render(){
        if(this.visible)
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

class Star{
    constructor(){
        const column = Math.floor(Math.random() * 8);
        this.x = column * tileWidth;
        
        const row = Math.floor(Math.random() * 4) + 2;
        this.y = row * tileHeight - 9;
        
        this.sprite = 'images/Star.png';
        this.visible = true;
    }
    
    render(){
        if(this.visible)
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

class FallingStar{
    constructor(x,y){
        this.timeToFall = 4000;
        this.landingX = x;
        this.landingY = y;
        this.currentY = this.landingY - 250;
        this.speed = 400;// velocidade da queda
    }
    
    //multiplica a velocidade
    update(dt){
        this.currentY += (this.speed * dt);
    }
    
    render(){
         ctx.drawImage(Resources.get('images/Selector.png'), this.landingX, this.currentY);
    }
}

function updateSpeedModifier(modifier){
    for(const enemy of allEnemies){
        enemy.updateSpeed(modifier);
    }
}

$(document).ready(function(){
    speedSlider = $('#speed-slider');
    ouchSound.src = "sounds/ouch2.wav";
    splashSound.src = "sounds/splash.wav";
    marioStarSound.src = "sounds/marioStar.mp3";
    heartSound.src = "sounds/magic1.wav";
    
    speedSlider.on('input',function(){
        let speedModifier = parseInt($(this).val());
        updateSpeedModifier(speedModifier);
    });
    
    
    $("canvas").wrap( "<div class='new'></div>" );
    $(".new").append("<div id='box'></div>");
    
    $('.btnRound').click(function(){
        
        var element = $('.fa');//toggle
        if(element.hasClass('fa-volume-off')){
            element.removeClass('fa-volume-off');
            element.addClass('fa-volume-up');
            shouldPlaySounds = true;
        }else{
            element.removeClass('fa-volume-up');
            element.addClass('fa-volume-off');
            shouldPlaySounds = false;
        }
    });
    
    $("#players img").click(function(){
        
        $(".selected").removeClass('selected');
        $(this).addClass('selected');
        player.sprite = $(this)/*.children("img")*/.attr('src');
    });
    
});

// Instancia os objetos 
// Coloca os inimigos no array de inimigos
// inicializa o jogador na variável
var allEnemies = [new Enemy(1), new Enemy(2), new Enemy(3), new Enemy(4), new Enemy(5), new Enemy(6)];

var player = new Player('boy');

var gem = new Gem();

var heart = new Heart();

var star = new Star();

document.addEventListener('keyup', function(e) {
    speedSlider.blur();
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };    

    player.handleInput(allowedKeys[e.keyCode]);
});
