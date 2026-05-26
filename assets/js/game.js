class Drawable {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.offsets = {
            x: 0,
            y: 0
        }
    }

    update() {
        this.x += this.offsets.x;
        this.y += this.offsets.y;
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.className = "element " + this.constructor.name.toLowerCase();
        $('.elements').append(this.element);
    }

    draw() {
        // Изменяем свойства по отдельности — это гарантирует,
        // что backgroundColor, заданный в кирпичах, не сотрется!
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.width = `${this.w}px`;
        this.element.style.height = `${this.h}px`;
    }

    removeElement() {
        this.element.remove();
    }

    isCollision(element) {
        let a = {
            x1: this.x,
            y1: this.y,
            x2: this.x + this.w,
            y2: this.y + this.h,
        }
        let b = {
            x1: element.x,
            y1: element.y,
            x2: element.x + element.w,
            y2: element.y + element.h,
        }
        return a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;
    }
}

class Ball extends Drawable {
    constructor(game) {
        super(game);
        this.w = 30; // Ширина шарика в пикселях
        this.h = 30; // Высота шарика в пикселях

        // Спавн строго по центру экрана
        this.x = window.innerWidth / 2 - this.w / 2;
        this.y = window.innerHeight / 2 - this.h / 2;

        // Скорость перемещения по осям (X и Y)
        this.offsets.y = -5; // Изначально летит вверх
        this.offsets.x = random(0, 1) === 1 ? 5 : -5; // Случайное направление влево или вправо

        this.createElement(); // Создание div-элемента в DOM
    }

    update() {
        // 1. Столкновение с ракеткой игрока
        if (this.isCollision(this.game.player)) {
            if (this.offsets.y > 0) {
                // Вычисляем точку удара от -1 (левый край) до 1 (правый край)
                let playerCenter = this.game.player.x + (this.game.player.w / 2);
                let ballCenter = this.x + (this.w / 2);
                let hitPoint = (ballCenter - playerCenter) / (this.game.player.w / 2);

                // Ограничиваем hitPoint, чтобы мяч не улетал совсем горизонтально
                if (hitPoint > 0.8) hitPoint = 0.8;
                if (hitPoint < -0.8) hitPoint = -0.8;

                // Базовая неизменная скорость мяча
                const TOTAL_SPEED = 8;

                // Рассчитываем новые направления по законам тригонометрии
                // Благодаря этому общая скорость всегда будет равна TOTAL_SPEED
                this.offsets.x = hitPoint * TOTAL_SPEED;
                this.offsets.y = -Math.sqrt(TOTAL_SPEED * TOTAL_SPEED - this.offsets.x * this.offsets.x);

                // Корректируем позицию, чтобы избежать залипания
                this.y = this.game.player.y - this.h;
            }
        }

        // 2. Отскок от левой и правой стены
        if (this.x <= 0) {
            this.x = 0;
            this.offsets.x = -this.offsets.x; // Меняем направление по горизонтали
        } else if (this.x + this.w >= window.innerWidth) {
            this.x = window.innerWidth - this.w;
            this.offsets.x = -this.offsets.x; // Меняем направление по горизонтали
        }

        // 3. Отскок от потолка
        if (this.y <= 0) {
            this.y = 0;
            this.offsets.y = -this.offsets.y;
        }

        // 4. Падение под экран (урон или проигрыш)
        if (this.y > window.innerHeight) {
            this.takeDamage();
        }

        super.update(); // Двигаем шарик по новым offsets
    }


    takeDamage() {
        // Удаляем шарик из массива элементов игры и из DOM
        if (this.game.remove(this)) {
            this.removeElement();
            this.game.hp--; // Отнимаем жизнь

            // Если жизни еще остались, спавним новый шарик на замену
            if (this.game.hp >= 0) {
                this.game.ball = this.game.generate(Ball);
            }
        }
    }
}

// class Fruit extends Drawable {
//     constructor(game){
//         super(game);
//         this.w = 70;
//         this.h = 70;
//         this.y = 60;
//         this.x = random(0, window.innerWidth - this.w);
//         this.offsets.y = 3;
//         this.offsets.x = random(-5, 5);
//         this.createElement();
//     }
//
//
//     update() {
//         if(this.isCollision(this.game.player)) this.takePoint();
//         if(this.y > window.innerHeight) this.takeDamage();
//
//         if(this.x <= 0 || this.x + this.w >= window.innerWidth) {
//             this.offsets.x = -this.offsets.x;
//         }
//         super.update();
//     }
//     takePoint() {
//         if(this.game.remove(this)) {
//             this.removeElement();
//             this.game.points++;
//         }
//     }
//
//     takeDamage() {
//         if(this.game.remove(this)) {
//             this.removeElement();
//             this.game.hp--;
//         }
//
//     }
//
// }
//
// class Banana extends Fruit {
//     constructor(game) {
//         super(game);
//     }
// }
//
// class Apple extends Fruit {
//     constructor() {
//         super(game);
//         this.offsets.y = 5;
//     }
// }
//
// class Orange extends Fruit {
//     constructor(game) {
//         super(game);
//         this.offsets.y = 7;
//     }
// }


class Brick extends Drawable {
    // Теперь конструктор принимает игру, координаты и цвет
    constructor(game, x, y, color) {
        super(game);
        this.w = 80;
        this.h = 25;
        this.x = x; // Сразу сохраняем правильный X
        this.y = y; // Сразу сохраняем правильный Y
        this.color = color || '#ff0055'; // Если цвет не передали, будет розовый

        this.createElement(); // Создаем элемент в HTML

        // Сразу красим блок ДО того, как движок начнет его обновлять
        this.element.style.backgroundColor = this.color;
    }

    update() {
        if (this.isCollision(this.game.ball)) {
            this.game.ball.offsets.y = -this.game.ball.offsets.y;
            this.destroy();
        }
    }

    destroy() {
        if (this.game.remove(this)) {
            this.removeElement();
            this.game.points += 10;
            this.game.checkWinCondition();
        }
    }
}

class Player extends Drawable {
    constructor(game) {
        super(game);
        this.w = 244;
        this.h = 109;
        this.x = window.innerWidth / 2 - this.w / 2;
        this.y = window.innerHeight - this.h;
        this.speedPerFrame = 20;
        this.skillTimer = 0;
        this.couldTimer = 0;
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false
        }
        this.createElement();
        this.bindKeyEvents();
    }

    bindKeyEvents() {
        document.addEventListener('keydown', ev => this.changeKeyStatus(ev.code, true))
        document.addEventListener('keyup', ev => this.changeKeyStatus(ev.code, false))
    }

    changeKeyStatus(code, value) {
        if (code in this.keys) this.keys[code] = value;
    }


    update() {
        if (this.keys.ArrowLeft && this.x > 0) this.offsets.x = -this.speedPerFrame;
        else if (this.keys.ArrowRight && this.x < window.innerWidth - this.w) this.offsets.x = this.speedPerFrame;
        else this.offsets.x = 0;
        super.update();
    }
}

class Game {
    constructor() {
        this.name = name;
        this.elements = [];
        this.player = this.generate(Player);
        this.counterForTimer = 0;
        this.ball = this.generate(Ball);
        this.hp = 3;
        this.points = 0;
        this.time = {
            m1: 0,
            m2: 0,
            s1: 0,
            s2: 0
        };
        this.ended = false;
        this.pause = false;
        this.keyEvents();
    }

    checkWinCondition() {
        // Проверяем, остался ли на поле хоть один кирпич
        // Метод .some() возвращает true, если находит в массиве elements хотя бы один объект класса Brick
        let hasBricks = this.elements.some(el => el instanceof Brick);

        // Если кирпичей больше нет (!hasBricks), то игрок победил!
        if (!hasBricks) {
            this.end(true, 'Вы уничтожили все блоки!');
        }
    }

    generateBrickGird() {
        const rows = 4;
        const cols = 10;
        const brickW = 80;
        const brickH = 25;
        const padding = 15;
        const offsetTop = 120;
        const totalGridWidth = (cols * brickW) + ((cols - 1) * padding);
        const offsetLeft = (window.innerWidth - totalGridWidth) / 2;
        const colors = ['#ff0055', '#ff5500', '#ffaa00', '#00ff66'];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let brickX = offsetLeft + c * (brickW + padding);
                let brickY = offsetTop + r * (brickH + padding);

                // ИСПРАВЛЕНО: Создаем кирпич напрямую через new и передаем ВСЕ параметры сразу
                let brick = new Brick(this, brickX, brickY, colors[r]);

                // Вручную добавляем его в массив игры, чтобы работал цикл updateElements()
                this.elements.push(brick);
            }
        }
    }

    start() {
        this.loop();
        this.generateBrickGird();
    }

    generate(className) {
        let element = new className(this);
        this.elements.push(element);
        return element;
    }

    keyEvents() {
        addEventListener('keydown', ev => {
            if (ev.code === "Escape") this.pause = !this.pause;
        })
    }

    loop() {
        requestAnimationFrame(() => {
            if (!this.pause) {
                document.querySelectorAll('.element').forEach(el => el.classList.remove('paused'));
                this.counterForTimer++;
                if (this.counterForTimer % 60 === 0) {
                    this.timer();
                }
                if (this.hp < 0) {
                    this.end();
                }
                $('.pause').style.display = 'none';
                this.updateElements();
                this.setParams();
            } else if (this.pause) {
                $('.pause').style.display = 'flex';
                document.querySelectorAll('.element').forEach(el => el.classList.add('paused'));
            }
            if (!this.ended) this.loop()
        });
    }

    updateElements() {
        // Вызываем обновление и отрисовку для копии массива,
        // чтобы удаление блоков во время удара мяча не ломало цикл
        [...this.elements].forEach(element => {
            element.update();
            element.draw();
        })
    }

    setParams() {
        let params = ['name', 'points', 'hp'];
        let values = [this.name, this.points, this.hp];
        params.forEach((param, ind) => {
            $(`#${param}`).innerHTML = values[ind];
        });
    }

    remove(el) {
        let idx = this.elements.indexOf(el);
        if (idx !== -1) {
            this.elements.splice(idx, 1);
            return true;
        }
        return false;

    }

    timer() {
        let time = this.time;
        time.s2++;
        if (time.s2 >= 10) {
            time.s2 = 0;
            time.s1++;
        }
        if (time.s1 >= 6) {
            time.s1 = 0;
            time.m2++;
        }
        if (time.m2 >= 10) {
            time.m2 = 0;
            time.m1++;
        }
        $('#timer').innerHTML = `${time.m1}${time.m2}:${time.s1}${time.s2}`;
    }

    end(isWin, reason) {
        this.ended = true; // Останавливаем игровой цикл loop
        let time = this.time;

        // Проверяем наличие HTML-элементов перед тем, как записывать в них текст
        // Это защитит игру от падения, если какого-то ID нет на странице оконцовки
        if (isWin) {
            if ($('#playerName')) $('#playerName').innerHTML = `Поздравляем, ${this.name}!`;
            if ($('#congratulation')) $('#congratulation').innerHTML = `Вы выиграли! 🎉 ${reason}`;
        } else {
            if ($('#playerName')) $('#playerName').innerHTML = `Жаль, ${this.name}!`;
            if ($('#congratulation')) $('#congratulation').innerHTML = `Вы проиграли! 💥 ${reason}`;
        }

        if ($('#endTime')) $('#endTime').innerHTML = `Оставшееся время: ${time.m1}${time.m2}:${time.s1}${time.s2}`;
        if ($('#collectedFruits')) $('#collectedFruits').innerHTML = `Вы набрали: ${this.points} очков`;

        // Переключаем экран на финальный
        go('end', 'panel d-flex flex-column justify-content-center align-items-center text-center');
    }
}