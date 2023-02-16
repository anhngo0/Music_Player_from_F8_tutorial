//  chức năng chính của player
//  1. render ra giao diện
//  2. scroll top
//  3. play / pause / seek
//  4 cd rotate
//  5.next /prev
//  6.random
//  7.next / repeat khi end
//  8.active song
//  9. scroll active song to view
//  10.play song when click 

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PlAYER_STORAGE_KEY = "F8_PLAYER";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");
const cdWidth = cd.offsetWidth;

const app = {
    currentIndex: 0,
    isplaying: false,
    isRandom:false,
    isRepeat:false,
    config:JSON.parse(localStorage.getItem('PlAYER_STORAGE_KEY')) || {},
  // (1/2) Uncomment the line below to use localStorage
  // config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "seiza ni naretara",
      singer: "kesshoku band",
      path: "./music/AiNoScenarioMagicKaito1412Opening2-ChicoHoneyWorks-3772273.mp3",
      image: "https://i.ytimg.com/vi/jTLhQf5KJSc/maxresdefault.jpg"
    },
    // {
    //   name: "Tu Phir Se Aana",
    //   singer: "Raftaar x Salim Merchant x Karma",
    //   path: "https://open.spotify.com/track/5ORPYXJKlpHWIdceavSGrL?si=e278ca31976544c9",
    //   image:
    //     "https://1.bp.blogspot.com/-kX21dGUuTdM/X85ij1SBeEI/AAAAAAAAKK4/feboCtDKkls19cZw3glZWRdJ6J8alCm-gCNcBGAsYHQ/s16000/Tu%2BAana%2BPhir%2BSe%2BRap%2BSong%2BLyrics%2BBy%2BRaftaar.jpg"
    // },
    {
      name: "Naachne Ka Shaunq",
      singer: "Raftaar x Brobha V",
      path: "./music/HikariShoumeiron-ChicoHoneyWorks-5574579.mp3",
      image: "https://i.ytimg.com/vi/QvswgfLDuPg/maxresdefault.jpg"
    },
    {
      name: "Mantoiyat",
      singer: "Raftaar x Nawazuddin Siddiqui",
      path: "./music/KoiiroNiSake-ChicoHoneyWorks-4405122.mp3",
      image:
        "https://a10.gaanacdn.com/images/song/39/24225939/crop_480x480_1536749130.jpg"
    },
    {
      name: "Aage Chal",
      singer: "Raftaar",
      path: "./music/KoiNoCode-ChicoHoneyWorks-4183474.mp3",
      image:
        "https://a10.gaanacdn.com/images/albums/72/3019572/crop_480x480_3019572.jpg"
    },
    {
      name: "Feeling You",
      singer: "Raftaar x Harjas",
      path: "./music/SekaiWaKoiNiOchiteiruAoHaruRideOpening-ChicoHoneyWorks-3292202.mp3",
      image:
        "https://a10.gaanacdn.com/gn_img/albums/YoEWlabzXB/oEWlj5gYKz/size_xxl_1586752323.webp"
    }
  ],
     setConfig: function(key, value){
      this.config[key] = value;
      localStorage.setItem('PlAYER_STORAGE_KEY',JSON.stringify( this.config))
     },
  render: function(){
    let htmls = this.songs.map((song,index)=>{
        return `<div class="song ${index === this.currentIndex ? 'active':""} data-index = ${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>`
    })
   playlist.innerHTML = htmls.join('');
  },
  defineProperties: function(){
    Object.defineProperty(this, 'currentSong',{
        get:function(){
            return this.songs[this.currentIndex];
        } 
    })
  },
  handleEvents: function(){
    const _this = this; //gán this(app) cho _this
    // xử lí phóng to thu nhỏ
    document.onscroll = function(){
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const cdNewWidth = cdWidth - scrollTop;
        cd.style.width = cdNewWidth > 0? cdNewWidth + "px": 0;
        cd.style.opacity = cdNewWidth / cdWidth;
    }

    // rotate cd thumb
    const cdThumbAnimate = cdThumb.animate([
      { transform: 'rotate(360deg)'}
    ], {
      duration:10000, //10 seconds
      iterations:Infinity
    })
    cdThumbAnimate.pause()

    // xử lí khi click play
    playBtn.onclick = function(){
        if(_this.isplaying){
            audio.pause();
        }
        else{
            audio.play(); 
        }
    };
    audio.onplay = function() {
        _this.isplaying = true;
        cdThumbAnimate.play();
        player.classList.add('playing');
    };
    audio.onpause = function() {
        _this.isplaying = false;
        cdThumbAnimate.pause();
        player.classList.remove('playing');
    };
    // kh tiến độ bài thay đổi
    audio.ontimeupdate = function(){
        if(audio.duration){
          const progressPercent = Math.floor(audio.currentTime / audio.duration *100);
          progress.value = progressPercent
        }
    }

    // xử lí khi tua song
    progress.onchange = function(e){
      const seekTime = audio.duration /100 * e.target.value;
      audio.currentTime = seekTime
    }

    // sang bài hát tiếp theo 
    nextBtn.onclick = function(){
      if(_this.isRandom){
        _this.randomSong();
      } else {
        _this.nextSong()
      }
      audio.play()
      _this.render()
      _this.scrollToActiveSong()
    }

    // về bài trước
    prevBtn.onclick = function(){
      if(_this.isRandom){
        _this.randomSong();
      } else {
        _this.prevSong()
      }
      audio.play()
      _this.render()
      _this.scrollToActiveSong()
    }
    
    //xử lí khi bài hát end
    audio.onended = function(){
      if(_this.isRepeat){
        audio.play();
      } else {
        nextBtn.click();
      }
    }

    // chế độ random songs
    randomBtn.onclick = function(){
      _this.isRandom = !_this.isRandom
      _this.setConfig('isRandom',_this.isRandom)
      randomBtn.classList.toggle("active",_this.isRandom);
    }

    // xử lí lặp lại bài hát
     repeatBtn.onclick = function(){
      _this.isRepeat = !_this.isRepeat
      _this.setConfig('isRepeat',_this.isRepeat)
      repeatBtn.classList.toggle("active",_this.isRepeat);
     }

    //  xử lí khi click vào bài hat sẽ chuyển sang bài hát ấy
    playlist.onclick = function(e){
      const songNode = e.target.closest('.song:not(.active)')
      if(songNode || e.target.closest('.option')){
        if(songNode){
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong()
          _this.render()
          audio.play()
        }
      }
    }
  }, 
  
  loadCurrentSong: function(){
    heading.innerHTML = this.currentSong.name;
    cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
    audio.src = this.currentSong.path
  },
  
  nextSong: function(){
    this.currentIndex++
    if(this.currentIndex >= this.songs.length){
      this.currentIndex = 0
    }
    this.loadCurrentSong();
  },

  prevSong: function(){
    this.currentIndex--
    if(this.currentIndex < 0){
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
   
  scrollToActiveSong: function(){
     setTimeout(()=>{
      $('.song.active').scrollIntoView({
        behavior:'smooth',
        block:'nearest',
      })
     },200)
  },

  randomSong: function(){
    let newIndex;
    do{
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while(newIndex === this.currentIndex)
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  start: function(){
    // định nghĩa các thuộc tính của object
    this.defineProperties();

    // xử lí các event
    this.handleEvents();

    // đưa bài hát hiện tại lên UI
    this.loadCurrentSong();

    // render ra màn hình
    this.render();
  }
};

app.start();
  
  