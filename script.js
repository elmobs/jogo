var canvas, ctx, ALTURA, LARGURA, maxPulos = 3, VELOCIDADE = 5,
	estadoAtual, record, img, 
	pontosParaNovaFase = [5, 10, 15, 20],
	faseAtual = 0, //variaveis

	labelNovaFase = {
		texto: "",
		opacidade: 0.0,
		fadeIn: function(dt){
			var fadeInId = setInterval(function(){
				if (labelNovaFase.opacidade < 1.0)
					labelNovaFase.opacidade += 0.01;

				else {
					clearInterval(fadeInId);
				}
			}, 20 * dt)
		},
		fadeOut: function(dt) {
		var	fadeOutId = setInterval(function(){
				if (labelNovaFase.opacidade > 0.0)
					labelNovaFase.opacidade -= 0.01;

				else {
					clearInterval(fadeOutId);
				}
			}, 20 * dt)

		}
	},
	estados = {
		jogar: 0,
		jogando: 1,
		perdeu: 2,
	},
	chao = {
		y: 545,
		x: 0,
		altura: 30,
		atualiza: function() {
				this.x -= VELOCIDADE;
				if (this.x <= -80)
					this.x +=80;
		},
		desenha: function()	{
				spriteChao.desenha(this.x, this.y);
				spriteChao.desenha(this.x + spriteChao.largura, this.y);
		}
	},
	bloco = {
		x: 40,
		y: 0,
		altura: spriteBoneco.altura,
		largura: spriteBoneco.largura,
		gravidade: 1.6,
		VELOCIDADE: 0,
		forcaDoPulo: 23.6,
		qntPulos: 0,
		score: 0,
		rotacao: 0,
		vidas: 5,
		colidindo: false,

		atualiza: function() {
				this.VELOCIDADE += this.gravidade;
				this.y += this.VELOCIDADE;
				this.rotacao += Math.PI  * VELOCIDADE;
				if (this.y > chao.y - this.altura && estadoAtual != estados.perdeu) {
					this.y = chao.y - this.altura;
					this.qntPulos = 0;
					this.VELOCIDADE = 0;
				}
		},
		pula: function(){
		  if (this.qntPulos < maxPulos) {
		  	  this.VELOCIDADE = - this.forcaDoPulo;
			  this.qntPulos++;
		  }
		},
		reset: function(){
			this.VELOCIDADE = 0;
			this.y = 0;
			if (this.score > record) {
				localStorage.setItem("record", this.score);
				record = this.score;
			}
			this.vidas = 3;
			this.score = 0;

			VELOCIDADE = 2;
			faseAtual = 0;
			this.gravidade = 1.6;
		},
		desenha: function()	{
			ctx.save();
			ctx.translate(this.x + this.largura / 2, this.y + this.altura / 2);
			ctx.rotate(this.rotacao);
			spriteBoneco.desenha(-this.largura / 2, - this.altura / 2);
			ctx.restore();
		}
	},
	obstaculos = {
			_obs: [],
			_scored: false,
			cores: ["#ffbc1c", "#ff1c1c", "ff85e1", "#52a7ff", "#78ff5d"],
			tempoInsere: 0,
		insere: function(){
			this._obs.push({
					x: LARGURA,
					largura: 50,
					altura: 20 + Math.floor(120 * Math.random()),
					cor: this.cores[Math.floor(5 * Math.random())]
			});
			this.tempoInsere = 30 + Math.floor(21 * Math.random());
		},
		atualiza: function() {
				if (this.tempoInsere == 0)
					this.insere();
				else
					this.tempoInsere --;
				for (var i = 0, tam = this._obs.length; i < tam; i++) {
					var obj = this._obs[i];
					obj.x -= VELOCIDADE;

				if (!bloco.colidindo && obj.x <= bloco.x + bloco.largura && bloco.x <= obj.largura && chao.y - obj.altura <= bloco.y + bloco.altura){
					bloco.colidindo = true;
					setTimeout(function(){
						bloco.colidindo = false;
					}, 500);
						if (bloco.vidas >= 1)
							bloco.vidas--;
						else
							estadoAtual = estados.perdeu;					
				}
				else if (obj.x <= 0 && !obj._scored){
					bloco.score++;
					obj._scored = true;
					if (faseAtual < pontosParaNovaFase.length && bloco.score == pontosParaNovaFase[faseAtual])
						passarDeFase();
				}
				else if (obj.x <= - obj.largura) {
						this._obs.splice(i, 1);
						tam--;
						i--;
					}
				}
			},
		limpa: function() {
			this._obs = [];
		},
		desenha: function() {
				for (var i = 0, tam = this._obs.length; i < tam; i++) {
					var obs = this._obs[i];
					ctx.fillStyle = obs.cor;
					ctx.fillRect(obs.x, chao.y - obs.altura, obs.largura, obs.altura);
				}
			}
	};
	function clique (event)	{
		if (estadoAtual == estados.jogando)
			bloco.pula();
		else if (estadoAtual == estados.jogar) {
			estadoAtual = estados.jogando;
		}
		else if (estadoAtual == estados.perdeu && bloco.y >=2 * ALTURA) {
			estadoAtual = estados.jogar;
			obstaculos.limpa();
			bloco.reset();
		}
	}
	function passarDeFase(){
		VELOCIDADE++;
		faseAtual++;
		bloco.vidas++;

		if (faseAtual == 4)
			bloco.gravidade *= 0.6;

		labelNovaFase.texto = "Fase " + faseAtual;
		labelNovaFase.fadeIn(0.4);
		setTimeout(function(){
			labelNovaFase.fadeOut(0.4);
		}, 800);
		}
	function main (){
		ALTURA = window.innerHeight;
		LARGURA = window.innerWidth;
		if (LARGURA >= 500){
			LARGURA = 600;
			ALTURA = 600;
		}
		canvas = document.createElement("canvas");
		canvas.width = LARGURA;
		canvas.height = ALTURA;
		canvas.style.border = "5px solid #000";
		ctx = canvas.getContext("2d");
		document.body.appendChild(canvas);
		document.addEventListener("mousedown", clique);
		estadoAtual = estados.jogar;
		record = localStorage.getItem("record");
		if (record == null)
			record = 0;
		img = new Image();
		img.src = "imagens/fun_jogo.png";	
		roda();
	}
	function roda(){
		atualiza();
		desenha();
			window.requestAnimationFrame(roda);
	}
	function atualiza() {
			
		if (estadoAtual == estados.jogando)
			obstaculos.atualiza();

		chao.atualiza();
		bloco.atualiza();
	}
	function desenha () {
		bg.desenha(0, 0);

		ctx.fillStyle = "#000000";
		ctx.font = "50px Arial italic";
		ctx.fillText("Pulos", 30, 38);
		ctx.fillText(bloco.score, 65, 75);
		ctx.fillText("Vidas", 480, 38);
		ctx.fillText(bloco.vidas, 520, 75);
		ctx.fillStyle = "rgba(0, 0, 0, " + labelNovaFase.opacidade + ")";
		ctx.fillText(labelNovaFase.texto, canvas.width / 2 - ctx.measureText(labelNovaFase.texto).width / 2, canvas.height / 3);
		if (estadoAtual == estados.jogando)
			obstaculos.desenha();
		chao.desenha();	
		bloco.desenha();
		if (estadoAtual == estados.jogar)
			jogar.desenha(LARGURA / 2, ALTURA /2);
		if (estadoAtual == estados.perdeu){
			perdeu.desenha(LARGURA /2 - perdeu.largura / 2, ALTURA / 2 - perdeu.altura / 2 - spriteRecord.altura);
			spriteRecord.desenha(LARGURA / 2 - spriteRecord.largura / 2, ALTURA / 2 + perdeu.altura / 2 - spriteRecord.altura / 2 - 80);
			ctx.fillStyle = "#fff";
			ctx.fillText(bloco.score, 290, 285);
			if (bloco.score > record){
				novo.desenha(LARGURA / 2 - 250, ALTURA / 2 + 180);
				ctx.fillText(bloco.score, 290, 285 )
			}
		else 
			ctx.fillText(record, 290, 395);
		}
	}//inicializa o jogo	
	main();