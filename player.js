/**
 * dragProgress
 * @param  {object} data {$progressArc,$progressBar,$progressBox,$audio,callback_move,callback_up}
 */
function dragProgress(data) {
	var $progressArc = data.$progressArc,
		$progressBar = data.$progressBar,
		$progressBox = data.$progressBox,
		$audio = data.$audio,
		progressBox_offset = $progressBox.get(0).getBoundingClientRect(),
		changeVal = 0;

	// Click Mouse
	$progressArc.on("mousedown", function (ev) {
		var ev = ev ? ev : window.event;
		var ex = ev.clientX;
		var arcOffset = $progressArc.get(0).getBoundingClientRect();
		var arcOffset_L = arcOffset.left;
		var disX = ex - arcOffset_L;

		var moveArc = function (ev) {
			// Update Progress Bar
			var ev = ev ? ev : window.event;
			var ex2 = ev.clientX;
			var disX2 = (((ex2 - progressBox_offset.left - disX) / progressBox_offset.width) * 100).toFixed(2);
			disX2 = disX2 <= 0 ? 0 : (disX2 >= 100 ? 100 : disX2);
			// See If It Can Play
			if (!!$audio.attr("src")) {
				$progressBar.css("width", disX2 + "%");
				// Update
				changeVal = data.callback_move && data.callback_move(disX2);
			}
		};
		var offmouseup = function () {
			$(document).off("mousemove", moveArc);
			$(document).off("mouseup", offmouseup);
			// See If It Can Play
			if (!!$audio.attr("src")) {
				// Update
				data.callback_up && data.callback_up(changeVal);
			}

		};
		// Mouse Move 
		$(document).on("mousemove", moveArc);
		// Mouse Up
		$(document).on("mouseup", offmouseup);

	});
}
/**
 * audio error
 * @param {HTMLAudioElement} audio
 * 
 */
function audioError(audio) {
	// Audio File Error 
	// 0 = NETWORK_EMPTY - 音频/视频尚未初始化
	// 1 = NETWORK_IDLE - 音频/视频是活动的且已选取资源，但并未使用网络
	// 2 = NETWORK_LOADING - 浏览器正在下载数据
	// 3 = NETWORK_NO_SOURCE - 未找到音频/视频来源
	switch (+audio.networkState) {
		case 0:
			showTipBox("error", "Audio not Initialized");
			break;
		case 1:
			//showTipBox("error","音频是活动的且已选取资源，但并未使用网络");
			break;
		case 2:
			showTipBox("error", "Browser Downloading Data");
			break;
		case 3:
			showTipBox("error", "Cannot Find Audio Source");
			break;
		default: console.warn("SWITCH ERROR");
			break;
	}
}

$(function () {

	// Setting Up Basic Info
	var curPlayLine = 0, // Current Music Play Number当前播放曲目序号
		isDrag = false, // If Allowed to Drag the Progress Bar 是否允许拖动进度条
		timer = null, // Cache Timer 缓冲进度定时器timer
		volume = 0.5, // Default Volume 默认音量
		bufferCache = 0, // Default Progess Bar 默认缓存进度
		bufferCacheStep = 1e3; // 默认加载缓存的时间间隔

	// DOM
	var media = $("#audio").get(0), // Audio
		$playBtnGroup = $("#playBtnGroup"), // Play Button播放按钮组
		$muteBtn = $("#muteBtn"), // Mute Button 静音按钮
		$bgDisc = $("#bgDisc"), // Song Info 歌曲详情页 磁盘
		$discNeedle = $("#discNeedle"), // Song Info 歌曲详情页 磁针
		$bgBlur = $("#bgBlur"), // Song Info 歌曲详情页bg
		$songDetail = $("#songDetail"), // Song Info 歌曲详情页信息
		$smallwindow_albumPic = $("#smallwindow_albumPic"), // Mini Window for Album 小窗专辑图
		$smallwindow_songName = $("#smallwindow_songName"), // Mini Window for Some Name 小窗歌曲名字
		$smallwindow_singerName = $("#smallwindow_singerName"), // Mini Window for Singer 小窗歌手名字
		$infoList_playlist = $("#infoList_playlist"), // Playlist 歌单列表
		$trs = $infoList_playlist.find("tr"), // Playlist Tr 歌单列表tr
		$curTime = $("#audio_currentTime"), // Current Time 当前时间
		$duration = $("#audio_duration"), // Time 时长
		$time_progressBox = $("#progress_box"), // Progerss Box 进度条父元素
		$time_progressBar = $("#progress_bar"), // Progress Bar 进度条本身
		$time_progressArc = $("#progress_arc"), // DOT 圆点
		$progress_cache = $("#progress_cache"), // Progress Cache 缓冲进度条
		$vol_progressBox = $("#vol_progress_box"), // Volume Box 进度条父元素
		$vol_progressBar = $("#vol_progress_bar"), // Volume 进度条本身
		$vol_progressArc = $("#vol_progress_arc"); // Volume DOT 圆点

	// ======================Play Muisc Main Functions===============================

	// @param: curPlayIndex[,$trs,_that]
	var playMusic = function () {
		var $trs = null;
		var _this = null;

		// Searh Page 搜索页面
		if (arguments.length === 2) {
			$trs = arguments[0];
			_this = arguments[1];
		} else { // Playlist Page歌单页面
			$trs = $infoList_playlist.find("tr");
			_this = $trs.get(arguments[0]);
		}

		// 进度条初始化
		$time_progressBar.css("width", "0%");
		$progress_cache.css("width", "0%");
		// Pause 音频暂停播放
		media.pause();
		// Play Button Become a Pause Type 播放按钮变为暂停样式
		stylePlayBtn($playBtnGroup.find(".play"), "pause");
		// Grab Soure 获取资源
		$(media).attr("src", _this.dataset.audio);
		// Play 进行播放
		$(media).on("canplay", function () {
			this.play();
		});
		// Play Button Become a Play Type 播放按钮变为播放样式
		stylePlayBtn($playBtnGroup.find(".play"), "play");
		// Hight  高亮播放所在列
		$trs.find("td.index").each(function (index, item) {
			$(item).html(item.dataset.num).removeClass("active");
		});
		$(_this).find("td.index").html('<i class="fa fa-volume-up" aria-hidden="true"></i>').addClass("active");
		// Update Mini Window Song 刷新小窗歌曲信息
		$smallwindow_albumPic.attr("src", _this.dataset.albumPic);
		// Updaet Mini Window Album 刷新小窗专辑封面
		$smallwindow_songName.html(_this.dataset.songName);
		$smallwindow_singerName.html(_this.dataset.singerName);
		// Storing Info 储存当前歌曲必要信息
		sessionStorage.setItem("curPlayInfo_songID", _this.dataset.id);
		sessionStorage.setItem("curPlayInfo_songName", _this.dataset.songName);
		sessionStorage.setItem("curPlayInfo_singersName", _this.dataset.singerName);
		sessionStorage.setItem("curPlayInfo_albumName", _this.dataset.albumName);
		sessionStorage.setItem("curPlayInfo_albumPic", _this.dataset.albumPic);
		sessionStorage.setItem("curPlayInfo_audioSrc", _this.dataset.audio);

		// 刷新歌曲详情页bg和poster 
		$bgBlur.css({
			"backgroundImage": 'url("' + sessionStorage.getItem('curPlayInfo_albumPic') + '")'
		});
		$bgDisc.css({
			"backgroundImage": 'url("' + sessionStorage.getItem('curPlayInfo_albumPic') + '")'
		});
		// 刷新歌曲基本信息
		$songDetail.find(".songname").html(sessionStorage.getItem('curPlayInfo_songName'));
		$songDetail.find(".albumname").html(sessionStorage.getItem('curPlayInfo_singersName'));
		$songDetail.find(".singersname").html(sessionStorage.getItem('curPlayInfo_albumName'));
	};
	// Clear Cache 恢复清空缓存
	var resetAndClear = function () {
		bufferCache = 0;
		bufferCacheStep = 1e3;
	};

	// ===================Initialized===============================

	// Clear Timer清除定时器
	clearInterval(timer);
	// Storing Music 储存曲目数量
	sessionStorage.setItem("songLen", $trs.length);
	// Initialized Progress Bar 进度条初始化
	$time_progressBar.css("width", "0%");
	$vol_progressBar.css("width", "50%");
	// Cache Bar Initialized 缓冲条初始化
	$progress_cache.css("width", "0%");
	// Volume Initialized 音量初始化
	media.volume = volume;


	// ===============Double Click Playlist to Play=======================

	$infoList_playlist.on("dblclick", "tr", function (ev) {
		var _this = this;
		curPlayLine = +_this.dataset.index;
		playMusic(curPlayLine);
	});

	// ===================Player============================

	// Play Buttons
	$playBtnGroup.find(".play").on("click", function () {
		if (!media.src) {
			showTipBox("info", "No Resources");
		} else {
			if (!media.paused) {
				media.pause();
				// Play Button Type
				stylePlayBtn($playBtnGroup.find(".play"), "pause");
			} else {
				media.play();
				// Play Button Type
				stylePlayBtn($playBtnGroup.find(".play"), "play");
			}
			audioError(media);
		}
	});
	// Next Song 
	$playBtnGroup.find(".next").on("click", function () {
		resetAndClear();
		if (!media.src) {
			showTipBox("info", "No Resources");
		} else {
			var songLen = +sessionStorage.getItem("songLen");
			curPlayLine = curPlayLine + 1 >= songLen ? 0 : curPlayLine + 1;
			playMusic(curPlayLine);
		}
	});
	// Last Song
	$playBtnGroup.find(".prev").on("click", function () {
		resetAndClear();
		if (!media.src) {
			showTipBox("info", "No Resources");
		} else {
			var songLen = +sessionStorage.getItem("songLen");
			curPlayLine = curPlayLine - 1 < 0 ? songLen - 1 : curPlayLine - 1;
			playMusic(curPlayLine);
		}
	});
	// Mute
	$muteBtn.on("click", function () {
		if (!media.muted) {
			media.muted = true;
			$muteBtn.html('<i class="fa fa-volume-off" aria-hidden="true"></i>').attr("title", "Unmute");
			$vol_progressBar.css("display", "none");
		} else {
			media.muted = false;
			$muteBtn.html('<i class="fa fa-volume-up" aria-hidden="true"></i>').attr("title", "Mute");
			$vol_progressBar.css("display", "block");
		}
	});


	// ===============Play Listener=======================

	// Update Time
	$(media).on("timeupdate", function () {
		if (!isDrag) {
			var objTimeCurTime = formatTime(this.currentTime);
			var objTimeDuration = formatTime(this.duration);
			$curTime.html(objTimeCurTime.I + ":" + objTimeCurTime.S);
			$duration.html(objTimeDuration.I + ":" + objTimeDuration.S);
			// Updae Progess Bar
			$time_progressBar.css("width", (this.currentTime / this.duration).toFixed(4) * 100 + "%");
		}
	});
	// Play Finished Auto Play Next Song Until Last Song then Stop
	$(media).on("ended", function () {
		var songLen = +sessionStorage.getItem("songLen");
		if (curPlayLine + 1 >= songLen) {
			$(this).get(0).pause();
			stylePlayBtn($playBtnGroup.find(".play"), "pause");
		} else {
			curPlayLine = curPlayLine + 1;
			playMusic(curPlayLine);
		}
	});



	// ===============Drag Progress Bar=======================

	// Change Time
	dragProgress({
		$progressBox: $time_progressBox,
		$progressBar: $time_progressBar,
		$progressArc: $time_progressArc,
		$audio: $(media),
		callback_move: function (disX2) {
			// Change Play Time
			isDrag = true;
			var changeVal = (media.duration * disX2 / 100).toFixed(2);
			var objTime = formatTime(changeVal);
			$curTime.html(objTime.I + ":" + objTime.S);
			return changeVal;
		},
		callback_up: function (changeVal) {
			// Change Play Position
			isDrag = false;
			media.currentTime = changeVal;
			stylePlayBtn($playBtnGroup.find(".play"), "play");
		}
	});

	// Change Volume
	dragProgress({
		$progressBox: $vol_progressBox,
		$progressBar: $vol_progressBar,
		$progressArc: $vol_progressArc,
		$audio: $(media),
		callback_move: function (disX2) {
			// Update Volume
			media.volume = (1 * disX2 / 100).toFixed(2);
			if (media.volume <= 0) {
				$muteBtn.html('<i class="fa fa-volume-off" aria-hidden="true"></i>')
			} else {
				$muteBtn.html('<i class="fa fa-volume-up" aria-hidden="true"></i>')
			}
			return 0;
		}
	});

	// ===================Load Buffer=======================

	// Buffer 判断文件缓冲进度
	function laodBuffer() {
		// media.readyState==4
		if (media.readyState === 4) {
			// 获取已缓冲部分的 TimeRanges 对象
			var timeRanges = media.buffered;
			// 获取最后缓存范围的位置
			var timeBuffered = timeRanges.end(timeRanges.length - 1);
			// 获取缓存进度，值为0到1
			var bufferPercent = (timeBuffered / media.duration).toFixed(3);
			// 更新缓冲进度条
			$progress_cache.css("width", bufferPercent * 100 + "%");
			console.log(`已缓存${bufferPercent * 100}%`);
			if (bufferPercent >= 1) {
				clearInterval(timer);
			}
			if (bufferPercent === bufferCache) {
				bufferCacheStep *= 1.2;
				console.log(bufferCacheStep);
			}
			bufferCache = bufferPercent;
		}
		timer = setTimeout(laodBuffer, bufferCacheStep);
	}
	timer = setTimeout(laodBuffer, bufferCacheStep);
});