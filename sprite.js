function Sprite(x, y, largura, altura) {
	this.x = x;
	this.y = y;
	this.largura = largura;
	this.altura = altura;

	this.desenha = function(xCanvas, yCanvas) {
		ctx.drawImage(img, this.x, this.y, this.largura, this.altura, xCanvas, yCanvas, this.largura, this.altura);
	}

}
var bg = new Sprite(0, 0, 600, 600),
spriteBoneco = new Sprite(17, 694, 100, 100),
perdeu = new Sprite(135, 694, 200, 261),
jogar = new Sprite(606, 6, 275, 170),
novo = new Sprite(371, 694, 200, 120),
spriteChao = new Sprite(1, 607, 600, 70),
spriteRecord = new Sprite(353, 812, 200, 124);
