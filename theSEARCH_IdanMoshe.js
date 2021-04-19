(function (cjs, an) {

var p; // shortcut to reference prototypes
var lib={};var ss={};var img={};
lib.webFontTxtInst = {}; 
var loadedTypekitCount = 0;
var loadedGoogleCount = 0;
var gFontsUpdateCacheList = [];
var tFontsUpdateCacheList = [];
lib.ssMetadata = [];



lib.updateListCache = function (cacheList) {		
	for(var i = 0; i < cacheList.length; i++) {		
		if(cacheList[i].cacheCanvas)		
			cacheList[i].updateCache();		
	}		
};		

lib.addElementsToCache = function (textInst, cacheList) {		
	var cur = textInst;		
	while(cur != null && cur != exportRoot) {		
		if(cacheList.indexOf(cur) != -1)		
			break;		
		cur = cur.parent;		
	}		
	if(cur != exportRoot) {		
		var cur2 = textInst;		
		var index = cacheList.indexOf(cur);		
		while(cur2 != null && cur2 != cur) {		
			cacheList.splice(index, 0, cur2);		
			cur2 = cur2.parent;		
			index++;		
		}		
	}		
	else {		
		cur = textInst;		
		while(cur != null && cur != exportRoot) {		
			cacheList.push(cur);		
			cur = cur.parent;		
		}		
	}		
};		

lib.gfontAvailable = function(family, totalGoogleCount) {		
	lib.properties.webfonts[family] = true;		
	var txtInst = lib.webFontTxtInst && lib.webFontTxtInst[family] || [];		
	for(var f = 0; f < txtInst.length; ++f)		
		lib.addElementsToCache(txtInst[f], gFontsUpdateCacheList);		

	loadedGoogleCount++;		
	if(loadedGoogleCount == totalGoogleCount) {		
		lib.updateListCache(gFontsUpdateCacheList);		
	}		
};		

lib.tfontAvailable = function(family, totalTypekitCount) {		
	lib.properties.webfonts[family] = true;		
	var txtInst = lib.webFontTxtInst && lib.webFontTxtInst[family] || [];		
	for(var f = 0; f < txtInst.length; ++f)		
		lib.addElementsToCache(txtInst[f], tFontsUpdateCacheList);		

	loadedTypekitCount++;		
	if(loadedTypekitCount == totalTypekitCount) {		
		lib.updateListCache(tFontsUpdateCacheList);		
	}		
};
(lib.AnMovieClip = function(){
	this.actionFrames = [];
	this.ignorePause = false;
	this.currentSoundStreamInMovieclip;
	this.soundStreamDuration = new Map();
	this.streamSoundSymbolsList = [];

	this.gotoAndPlayForStreamSoundSync = function(positionOrLabel){
		cjs.MovieClip.prototype.gotoAndPlay.call(this,positionOrLabel);
	}
	this.gotoAndPlay = function(positionOrLabel){
		this.clearAllSoundStreams();
		var pos = this.timeline.resolve(positionOrLabel);
		if (pos != null) { this.startStreamSoundsForTargetedFrame(pos); }
		cjs.MovieClip.prototype.gotoAndPlay.call(this,positionOrLabel);
	}
	this.play = function(){
		this.clearAllSoundStreams();
		this.startStreamSoundsForTargetedFrame(this.currentFrame);
		cjs.MovieClip.prototype.play.call(this);
	}
	this.gotoAndStop = function(positionOrLabel){
		cjs.MovieClip.prototype.gotoAndStop.call(this,positionOrLabel);
		this.clearAllSoundStreams();
	}
	this.stop = function(){
		cjs.MovieClip.prototype.stop.call(this);
		this.clearAllSoundStreams();
	}
	this.startStreamSoundsForTargetedFrame = function(targetFrame){
		for(var index=0; index<this.streamSoundSymbolsList.length; index++){
			if(index <= targetFrame && this.streamSoundSymbolsList[index] != undefined){
				for(var i=0; i<this.streamSoundSymbolsList[index].length; i++){
					var sound = this.streamSoundSymbolsList[index][i];
					if(sound.endFrame > targetFrame){
						var targetPosition = Math.abs((((targetFrame - sound.startFrame)/lib.properties.fps) * 1000));
						var instance = playSound(sound.id);
						var remainingLoop = 0;
						if(sound.offset){
							targetPosition = targetPosition + sound.offset;
						}
						else if(sound.loop > 1){
							var loop = targetPosition /instance.duration;
							remainingLoop = Math.floor(sound.loop - loop);
							if(targetPosition == 0){ remainingLoop -= 1; }
							targetPosition = targetPosition % instance.duration;
						}
						instance.loop = remainingLoop;
						instance.position = Math.round(targetPosition);
						this.InsertIntoSoundStreamData(instance, sound.startFrame, sound.endFrame, sound.loop , sound.offset);
					}
				}
			}
		}
	}
	this.InsertIntoSoundStreamData = function(soundInstance, startIndex, endIndex, loopValue, offsetValue){ 
 		this.soundStreamDuration.set({instance:soundInstance}, {start: startIndex, end:endIndex, loop:loopValue, offset:offsetValue});
	}
	this.clearAllSoundStreams = function(){
		this.soundStreamDuration.forEach(function(value,key){
			key.instance.stop();
		});
 		this.soundStreamDuration.clear();
		this.currentSoundStreamInMovieclip = undefined;
	}
	this.stopSoundStreams = function(currentFrame){
		if(this.soundStreamDuration.size > 0){
			var _this = this;
			this.soundStreamDuration.forEach(function(value,key,arr){
				if((value.end) == currentFrame){
					key.instance.stop();
					if(_this.currentSoundStreamInMovieclip == key) { _this.currentSoundStreamInMovieclip = undefined; }
					arr.delete(key);
				}
			});
		}
	}

	this.computeCurrentSoundStreamInstance = function(currentFrame){
		if(this.currentSoundStreamInMovieclip == undefined){
			var _this = this;
			if(this.soundStreamDuration.size > 0){
				var maxDuration = 0;
				this.soundStreamDuration.forEach(function(value,key){
					if(value.end > maxDuration){
						maxDuration = value.end;
						_this.currentSoundStreamInMovieclip = key;
					}
				});
			}
		}
	}
	this.getDesiredFrame = function(currentFrame, calculatedDesiredFrame){
		for(var frameIndex in this.actionFrames){
			if((frameIndex > currentFrame) && (frameIndex < calculatedDesiredFrame)){
				return frameIndex;
			}
		}
		return calculatedDesiredFrame;
	}

	this.syncStreamSounds = function(){
		this.stopSoundStreams(this.currentFrame);
		this.computeCurrentSoundStreamInstance(this.currentFrame);
		if(this.currentSoundStreamInMovieclip != undefined){
			var soundInstance = this.currentSoundStreamInMovieclip.instance;
			if(soundInstance.position != 0){
				var soundValue = this.soundStreamDuration.get(this.currentSoundStreamInMovieclip);
				var soundPosition = (soundValue.offset?(soundInstance.position - soundValue.offset): soundInstance.position);
				var calculatedDesiredFrame = (soundValue.start)+((soundPosition/1000) * lib.properties.fps);
				if(soundValue.loop > 1){
					calculatedDesiredFrame +=(((((soundValue.loop - soundInstance.loop -1)*soundInstance.duration)) / 1000) * lib.properties.fps);
				}
				calculatedDesiredFrame = Math.floor(calculatedDesiredFrame);
				var deltaFrame = calculatedDesiredFrame - this.currentFrame;
				if((deltaFrame >= 0) && this.ignorePause){
					cjs.MovieClip.prototype.play.call(this);
					this.ignorePause = false;
				}
				else if(deltaFrame >= 2){
					this.gotoAndPlayForStreamSoundSync(this.getDesiredFrame(this.currentFrame,calculatedDesiredFrame));
				}
				else if(deltaFrame <= -2){
					cjs.MovieClip.prototype.stop.call(this);
					this.ignorePause = true;
				}
			}
		}
	}
}).prototype = p = new cjs.MovieClip();
// symbols:
// helper functions:

function mc_symbol_clone() {
	var clone = this._cloneProps(new this.constructor(this.mode, this.startPosition, this.loop, this.reversed));
	clone.gotoAndStop(this.currentFrame);
	clone.paused = this.paused;
	clone.framerate = this.framerate;
	return clone;
}

function getMCSymbolPrototype(symbol, nominalBounds, frameBounds) {
	var prototype = cjs.extend(symbol, cjs.MovieClip);
	prototype.clone = mc_symbol_clone;
	prototype.nominalBounds = nominalBounds;
	prototype.frameBounds = frameBounds;
	return prototype;
	}


(lib.Scene_1_background1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// background1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#323232").ss(3,1,1).p("AgJACIATgD");
	this.shape.setTransform(-0.5875,1617.425);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#252525").ss(3,1,1).p("AABAAIgBAA");
	this.shape_1.setTransform(-114.025,1243.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().s("#009900").ss(3,1,1).p("Ega2gsoIA4AdQBFAoBFA3QDcCwCCEEQCLEXgHLiQgDEdgaENQgYD9gfBxQgdBnAaD8QAXDqA+ERQA+EYBKDBQBRDWBFAhQB8A/FcJhQB9DcB2DlQBpDMAbBDEga2gsoIA8AKQBMAPBQAYQD9BMC9CGQEIC7BhEVQB5FaiUHUIgeBXQghBugTBsQg8FcBuDSIAVAlQAZAvAQA1QA0CngyCgIAHA7QAMBJAZBBQBQDVC0BGIA/BPQBLBoA5B+QC0GQhHHKICiIVQCuIoA3BkIisAwQgmgcgwg0QhfhpgyiAQgahBgegyQglg4gUggQhRh9hWjoQgziHhXhdQg1g5hohJQhlhGglgqQg/hIgQhpQgPhlhwhIQgkgXhJglQhYgtgigUQiVhVhKhwQhjiZAAjwQAAjdAzjYQBAjgAZhqQAqi0gRilQgVjPh0kRQhuj/AfkkQALhsAhiHQAEgPA5jSQBHkGgXiHQghjDjZiJgEAn3gucIg7AKQhKAPhOAZQj4BLi4CFQkDC8hfEVQh3FaCSHTIAdBZQAgBtATBtQA7FbhsDSIgVAlQgYAvgQA0QgzCpAxCgIgGA7QgMBHgZBDQhODUiwBGIg+BPQhKBog3B9QixGRBGHLIifIUQiqIng2BkICoAxQAlgbAvg1QBehpAxh/QAZhCAegzQAkg3AUggQBPh9BUjnQAyiIBVheQA0g5BmhIQBjhGAkgrQA+hHAPhpQAPhlBthIQAkgYBHglQBWgsAigTQCRhWBIhwQBiiYAAjyQAAjcgzjXQg+jhgYhqQgpi1AQijQAUjRBykPQBskBgekiQgLhughiHQgDgPg4jSQhGkFAWiIQAhjDDUiIIg2AeQhEAohDA3QjYCvh/EEQiIEYAHLgQADEfAZEMQAXD8AfBxQAcBogZD8QgXDqg8ESQg9EXhJDBQhPDVhDAjQh6A+lUJiQh7DchzDkQhnDMgbBEEgn2AK1IBsgPQCFgNB7AMQGKAlCWEHQCCDjgQDdQgGBYAFAOQAKAfA9gBIAaAIQAgANAbAWQBXBGAICHIAIAbQAOAhAaAeQBVBfC3AXIAXAKQAcARAXAcQBJBagDCvIC6BrQDDB5ArBDQBEBtBcC/IhcAWQg+hNhXhbQiui4h9hGQiohdiph2Qi+iEghg5QhsiohPiMQiYkNgFhvQgMgtgghRQhCihhqiwQhThZhlhHQjJiPkPATgEgY5AgRQgCgtgXg3Qg6iEiqhBQgpgfgrheQhWi5gKkxQgGhRhFhjQheiGljiSEgFGAuGIhcAXQgigygsg1QhYhrgygXQgYgKgNgUQgMgWgKgMQgoguidghQgygOg7gaQh2g0gtg8Qh+ANh1gnQgggLgagN");
	this.shape_2.setTransform(1878.425,1540.75);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#C45A89").s().p("EBnRAkfQA+ABAQgRQB4h4CgqgQAyjSAwjwIAmjGQAKh9ACh7IAlgQQHyjJKEC1IBNAxQBhA/BiBNQE7D2DTEbQEnGNAwGiQA6IJlPIKgEiTiAS4UAl4hlMBCyAwfQBMBsBMBzIAAABIACAAUgT/AOEgLaAm/IgJAMQvcTpx4AAQzpAA2l3rg");
	this.shape_3.setTransform(145.0343,1471.6785);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#D2365E").s().p("EAsyAjCQpXhNpog6IjQgSQrDg8nFADQpvAFiOB8IAAguICbgaMg00AAvIAJgMUALagm/AT/gOEIgCAAIAAgBQhMhzhMhsQBNg9BOg3IAAAAQJgmkPLjTQFthuGNASQJTAcJEFAIAJAFQLQGRKQM+IAjA9QArBPAsBfQCNEwBbFYQESQMkAQIIgGAVQgOA6gQA5QlTgzlYgsg");
	this.shape_4.setTransform(54.944,1404.665);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#837BB3").s().p("EgYRAyWIA+gLIAAAuQCOh9JwgEQgOB0gJBpQIUiDKKghIDQASQJoA5JXBOMg1WABfgEAoQAzhIB7ARIiAAEIAFgVgEgqKgIEIABABIAAAAIgBAAIAAgBgEgqJgIDIgBgBQA30hMvsPQMxsQMsgiQMrghI6GEQKNG9GxNRQlWBUk4CuQmqDtloGRIgJgFQpElApSgcQmNgSluBuQvLDTpgGkgEgqKgIEg");
	this.shape_5.setTransform(155.825,1295.0815);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#5252BB").s().p("EA0rAujQg/gBhvgUQirgemShiQoEh/k2hKQoqiDnOhfQp7iBpAhSIh8gRQEAwIkSwMQhblYiMkwQgshfgshPIgjg9QqQs+rQmRQFpmRGpjtQE4iuFXhTQOOjdRoGnIB8A9QCfBSCoBnQIbFMG2GuQJkJaFCLIQFhMLgPNqQgDB7gJB9IgmDGQgwDwgyDSQigKgh4B4QgQAQg3AAIgIAAgEg8OAfWQHEgDLDA8QqKAhoUCDQAIhoAPh1g");
	this.shape_6.setTransform(468.7699,1407.2531);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#7DB453").s().p("EgHwAs2QhYhrgygXQgYgKgNgUQgMgWgKgMQgoguidgiQgygOg7gZQh2g0gtg9Qh+ANh1gmQgggLgagNQAriTg0haQgfg2g8gcQgPgHgPgFQgCgtgXg2Qg6iDiqhCQgpgggrhdQhWi5gKkxQgGhShFhiQheiGljiSQAfgDAeAAIAAAAIABAAQDkABCvB5IABAAIAGAFQBlBHBTBYQBqCwBCCiQAgBRAMAtQAFBvCYENQBPCNBsCnQAhA5C+CDQCpB3CoBeQB9BFCuC4QBXBbA+BOIhcAVQgigxgsg1gEgHbAreQiui4h9hFQioheiph3Qi+iDghg5QhsinhPiNQiYkNgFhvQgMgtgghRQhCiihqiwQhThYhlhHIgGgFIgBAAQivh5jkgBIgBAAIAAAAQgeAAgfADIBsgPQCFgMB7ALQGKAlCWEGQCCDkgQDdQgGBXAFAPQAKAfA9gBIAaAIQAgAMAbAXQBXBFAICHIAIAcQAOAhAaAeQBVBfC3AXIAXAKQAcAQAXAdQBJBZgDCvIC6BsQDDB5ArBDQBEBsBcDAIhcAXQg+hOhXhbgEAAvAr4QhfhpgyiAQgahBgegzIg5hXQhRh9hWjnQgziIhXheQg1g4hohJQhlhGglgrQg/hHgQhpQgPhlhwhIQgkgYhJglQhYgsgigTQiVhWhKhwQhjiYAAjyQAAjcAzjYQBAjgAZhqQAqi0gRikQgVjRh0kQQhukAAfkiQALhuAhiHIA9jhQBHkFgXiIQghjCjZiJIA4AeQBFAoBFA2QDcCxCCEEQCEEIAAKmIAABKQgDEegaEMQgYD8gfByQgQA2AABgQAABWANB3QAXDqA+ESQA+EXBKDBQBRDVBFAjQB3A7FDIxIAeA0QB9DbB2DlQBpDMAbBEQgbhEhpjMQh2jlh9jbIgeg0QlDoxh3g7QhFgjhRjVQhKjBg+kXQg+kSgXjqQgNh3AAhWQAAhgAQg2QAfhyAYj8QAakMADkeIAAhKQAAqmiEkIQiCkFjciwQhFg2hFgoIg4geIA8ALQBMAOBQAYQD9BMC9CFQEIC8BhEVQB5FaiUHTIgeBYQghBugTBsQg8FdBuDRIAVAlQAZAvAQA0QA0CpgyCfIAHA7QAMBIAZBDQBQDTC0BGIA/BQQBLBoA5B9QC0GRhHHLICiIUQCuIoA3BjIisAxQgmgcgwg0gEAI7AqjQA2hjCqopICfoUQhGnKCxmQQA3h+BKhoIA+hQQCwhFBOjUQAZhDAMhHIAGg7QgxigAzipQAQg0AYgvIAVglQBsjRg7ldQgThsgghuIgdhYQiSnTB3laQBfkVEDi8QC4iFD4hMQBOgYBKgOIA7gKIg2AdQhEAnhDA3QjYCwh/EFQiCEJAAKoIABBHQADEdAZENQAXD9AfBwQAPA3AABgQAABWgMB3QgXDqg8ESQg9EXhJDBQhPDVhDAjQh6A+lUJiQh7DbhzDlQhnDMgbBEQAbhEBnjMQBzjlB7jbQFUpiB6g+QBDgjBPjVQBJjBA9kXQA8kSAXjqQAMh3AAhWQAAhggPg3QgfhwgXj9QgZkNgDkdIgBhHQAAqoCCkJQB/kFDYiwQBDg3BEgnIA2gdQjUCIghDCQgWCIBGEGQA4DRADAQQAhCHALBtQAeEihsEAQhyERgUDQQgQCkApC0QAYBqA+DhQAzDXAADcQAADyhiCYQhIBwiRBVQgiAUhWAsQhHAmgkAXQhtBIgPBlQgPBpg+BIQgkAqhjBGQhmBIg0A6QhVBdgyCHQhUDohPB9Ig4BXQgeAzgZBBQgxCAheBpQgvA0glAcg");
	this.shape_7.setTransform(1878.425,1540.75);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#7A68A4").s().p("EglOA24QhWgdinitQi0i7jDkSQnxq/kHscQlQv7CeuGQDCxOOcs+QOXs5QoibQNSh8OIE0QInC7IKFIQBcA5BaA+ICUBlQNZICElItQEoI0BqPqQBrPrARI2QAHDZADCVQAGDvgEBBQjjh8vDCvIgKABQh9AXiTAdQqwCIyfEUQ2JFzoqCGQsAC7jjAAQgvAAgYgIg");
	this.shape_8.setTransform(2600.0642,1392.8186);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#4A4E89").s().p("EgC/AxdIAKgCQiVAgiEAVQCTgdB8gWgEAPkAmKQgRo1hrvrQhqvrkoozQkloutXoCIiVhlQhag+hcg5QDSnPEikmQEyk2F9htQEQhNEbAfQCNAPBXAfUgATAuuABDAuhIgDABQgDiVgHjZg");
	this.shape_9.setTransform(2899.05,1312.7946);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]},1).to({state:[]},898).to({state:[{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]},117).wait(323));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_background0 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// background0
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#000000").ss(3,1,1).p("EjqXilvMHUvAAAMAAAFLfMnUvAAA");
	this.shape.setTransform(1500,939.2);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#63DAE7").s().p("EgjWClwMmOCAAAMAAAlLfMGOCAAAMHUvAAAMAAAFLfg");
	this.shape_1.setTransform(226.25,939.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_1},{t:this.shape}]},1).to({state:[]},898).to({state:[{t:this.shape_1},{t:this.shape}]},117).wait(323));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_background_cry = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// background_cry
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#63DAE7").s().p("ElvYC5PMAAAlydMLewAAAMAAAFydg");
	this.shape.setTransform(-232.35,705.025);
	this.shape._off = true;

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(899).to({_off:false},0).wait(117));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.sad_Eyes = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("AialOIACgGIBBhbQAZghAVgbQAqg0AegZQBwhbA9ggQBaguBagfQH5imGwFgQA2AtAyAuQFVFCBcGmQA1DwgiCrIglDJIgQBAIr7npQAAABgZCdQggCqgqBEQhjCjiNAAQiMAAhkijQhjiiAAjmQAAivBCiXQALgaAOgaQAAgBABgBIgBACIAAAAIp0mQIgCgBInKH+IgMANIAAABQBGCKgDDCQgEDGhQCLQhQCNhtAAQhuAAhKiNQgphMgRheIkbE8QhOiLg9jXQidoiHcn0QA1g5A9gmQCmhoDcAhQA/AJCMA+QB/A4C/BkAbzRfIAti+AQlG4IpLl2ApmCvIgMAOInAHzAqsyKIy1JGAyCTIQhxg9haifAiFUYQj5obBRnCQBSnCBBjHAchpYIwAq/");
	this.shape.setTransform(188.9932,130.375);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.rf(["#FF99FF","#000000"],[0,1],119.4,88.6,0,119.4,88.6,548.1).s().p("A6JIvQidoiHcn0QA1g5A9gmQCmhoDcAhQA/AJCMA+QB/A4C/BkInKH+IgMANIAAABInAHzIkbE8QhOiLg9jXgAN0FdIpLl1IABgCIgBACIp0mRIACgGIBBhbQAZghAVgbQArg0AegZQBwhbA8ggQBaguBagfQH5imGwFgQA2AtAyAuQFVFCBcGmQA1DwgiCrIglDJIgQBAg");
	this.shape_1.setTransform(206.6821,139.4536);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#000000").s().p("AHqEwQhkijABjlQgBivBCiWQALgbAOgaIABAAIJKF2IgZCdQggCrgqBEQhjCjiNAAQiLAAhkijgAvxFGQgphMgRheIHAnzQBHCLgEDBQgEDFhQCMQhPCNhuAAQhuAAhKiNg");
	this.shape_2.setTransform(188.25,183.625);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FFFFFF").s().p("AhcOEIgbgKQgagQgbgWQhchLhliLIgBABQhiBBiEAyQkJBlirhKQiCg5iAhiIhWhAIgLgDQhxg9haifIEak7QASBeAoBMQBLCNBuAAQBtAABQiNQBPiMAEjFQAEjBhGiLIAMgOIHKn/IACACQhBDGhSHDQgUBvAAB0QAAFjC8GWQi8mWAAljQAAh0AUhvQBSnDBBjGIJzGQQgNAagMAbQhBCWAACvQAADlBjCjQBkCjCMAAQCNAABiijQAqhEAhiqIAYieIL8HpIgtC9IgBAAQg4BJhLBWQiWCshlBAIgFADQgrAbgtAVQgeAOgfALIhAAUQjnA4jfAAQksAAkbhlg");
	this.shape_3.setTransform(212.3,196.82);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f().s("#000000").ss(3,1,1).p("A26i+QChCLCaBAQBXAkBWANQEVAoEAjUIABAAQAfArAfAkQBkB0B/BHQEOCWGIgLQJIgQF3o+IABAA");
	this.shape_4.setTransform(220.2,271.8105);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("AialOIACgGIBBhbQAZghAVgbQAqg0AegZQBwhbA9ggQBaguBagfQH5imGwFgQA2AtAyAuQFVFCBcGmQA1DwgiCrIglDJIg9D+AialOIgCgBQi/hkh/g4QiMg+g/gJQjcghimBoQg9Amg1A5QncH0CdIiQA9DXBOCLQBaCfBxA9AHaBCIAAAAApyC8IAAABAqsyKIy1JGAiFUYQj5obBRnCQBSnCBBjHAchpYIwAq/");
	this.shape_5.setTransform(188.9932,130.375);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#FFFFFF").s().p("AHiBYIgbgKQgagQgbgWQg/gyhFhTQBlB0B/BHIgQgGgAnKgeIgngSQBXAkBWAMQhJgEg9gag");
	this.shape_6.setTransform(154.8125,278.0125);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.rf(["#FF99FF","#000000"],[0,1],119.4,53.3,0,119.4,53.3,548.1).s().p("AgURmQh/hHhkh0QgfglgfgqIAAgBIgBABQi8mWAAlkQAAhzAUhvQBSnDBBjHQhBDHhSHDQgUBvAABzQAAFkC8GWQhiBBiDAyQisBBiEgIQhVgMhYglQhtg2hthTIhVg/IgMgDQhxg9haifQhOiLg9jXQidohHcn1QA1g5A9gmQCmhoDcAhQA/AJCMA+QB/A4C/BkIACABIACgGIBBhbQAZghAVgbQArg0AegZQBwhbA8ggQBaguBagfQH5imGwFgQA2AtAyAuQFVFCBcGnQA1DvgiCrIglDJIg9D+IgBAAQg3BJhMBWQiWCshlBAIgFADQgrAbgtAUQgeAOgfALIhAAUQi2AsixA4Ig0ABQlmAAj8iMgAsjj/IAAABIAMgOgAEpl5IAAAAIABgCIgBACgAk2NcIAAAAg");
	this.shape_7.setTransform(206.6821,174.7641);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4}]},65).wait(10));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1.5,-1.5,381,304.4);


(lib.plants4 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#CCFFCC").s().p("EAE4Aw6QAKhbAHhoIAFhVInWioQnXh0kTjgQjoi9g+jqQg2jKBTibQAlhGA5gmQA7gnBEADQDkAKDVHUQBqDqA9DoQCdCgEOB0QBVAkBWAcIBGAUQA5igiCmwQgoiHg2iSIguh3Qj7jhi8ouQg7ivgti6IgiiYIkZiAQu7n4AZlOQAIhpBphKQAggYAngRIAggNQDIgPHoKnQBfCDBOB2QAUApAXAlQA2BTAIAJQAHAIgkg7Qgkg6gog9QiMkpAuo5QARjLAnjXIAjitQgugGh/izQiCi3hwjbQiAj8gjitQgpjNBngvQC5hVDTJaQBpEtBFE+ICfpQQm+nMh+noQgniZgCiJIAFhqQEKjwD7EoQB9CUBJDEQDaDSjYRUQhtIqiYIAQGPxgGpjQQCFhBB4AiQAlAKAfAUQAQAJAJAIQCaDkiTDpQhoCklFDxIkMDEQiZBzhdBVQj5DnAADLQAAGFFtLUQC1FqC3EcQEgzXFolmQEwkxGQEvQCoB9ikE1QiDD3lQFgQjwD7k+EXQifCLhwBZQEKCCgtLMQgXFmhMFMQGisgGajAQCBg8BwAIQAjACAdAJIAWAJQDHCwiKDjQhuC2k/DPQjkCTk2CRQibBJhtArIiRAYQA5g8Ajkkg");
	this.shape.setTransform(165.2228,348.1769);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#CCFFCC").s().p("EAEIAw6QAMhbAJhoIAHhVInUioQnVh0kPjgQjli9g6jqQgzjKBWibQAmhGA6gmQA8gnBDADQDkAKDNHUQBnDqA4DoQCbCgEMB0QBVAkBVAcIBFAUQA8igh6mwQgmiHg0iSIgsh3Qj3jhizouQg3ivgri6IgfiYIkXiAQuyn4AflOQAJhpBqhKQAhgYAngRIAggNQDIgPHdKnQBdCDBMB2QATApAXAlQA0BTAIAJQAHAIgjg7Qgjg6gng9QiHkpA4o5QAUjLAqjXIAnitQgvgGh8izQh/i3hrjbQh8j8ggitQgmjNBngvQC7hVDJJaQBkEtA/E+ICqpQQm3nMh1noQgliZAAiJIAHhqQEOjwD2EoQB7CUBFDEQDWDSjqRUQh2IqigIAQGhxgGsjQQCHhBB3AiQAlAKAfAUQAQAJAIAIQCWDkiXDpQhqCklJDxIkPDEQicBzheBVQj9DngDDLQgGGFFgLUQCwFqCxEcQE1zXFulmQE1kxGLEvQCmB9ipE1QiID3lWFgQj0D7lCEXQiiCLhxBZQEICCg6LMQgcFmhSFMQGwsgGdjAQCCg8BvAIQAjACAdAJIAXAJQDDCwiODjQhxC2lCDPQjnCTk4CRQicBJhuArIiRAYQA6g8Ankkg");
	this.shape_1.setTransform(170.8201,348.1769);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#CCFFCC").s().p("EABHAw6QARhbAPhoIAMhVInKioQnOh0kCjgQjai9gtjqQgnjKBeibQArhGA9gmQA9gnBDADQDkAKCyHUQBZDqArDoQCRCgEHB0QBSAkBTAcIBEAUQBEighgmwQgfiHgriSIglh3QjqjhiSouQgtivggi6IgWiYIkQiAQuVn4AzlOQAOhpBvhKQAigYAogRIAigNQDIgPG2KnQBVCDBFB2QAQApAVAlQAwBTAHAJQAHAIggg7Qgfg6gkg9Qh2kpBZo5QAgjLA3jXIAwitQgtgGhyizQh0i3hfjbQhuj8gWitQgajNBqgvQDAhVCmJaQBTEtAsE+IDMpQQmbnMhanoQgciZAJiJIANhqQEcjwDlEoQByCUA6DEQDKDSkrRUQiWIqi+IAQHhxgG5jQQCLhBB1AiQAlAKAdAUQAQAJAHAIQCJDkilDpQhzCklYDxIkbDEQihBzhjBVQkKDngPDLQgdGFE1LUQCcFqCgEcQF9zXGDlmQFHkxF5EvQCfB9i7E1QiWD3lqFgQkDD7lTEXQipCLh2BZQEACChkLMQgxFmhlFMQHesgGpjAQCFg8BvAIQAjACAcAJIAWAJQC5CwibDjQh7C2lPDPQjvCTlBCRQifBJhxArIiSAYQA8g8A5kkg");
	this.shape_2.setTransform(191.7788,348.1769);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape}]}).to({state:[{t:this.shape_1}]},8).to({state:[{t:this.shape_2}]},9).to({state:[{t:this.shape_1}]},8).wait(9));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,353.8,696.4);


(lib.plants3 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#C36183").s().p("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");
	this.shape.setTransform(169.3083,176.5735);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#C36183").s().p("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");
	this.shape_1.setTransform(174.2025,176.5735);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#C36183").s().p("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");
	this.shape_2.setTransform(181.4648,176.5735);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#C36183").s().p("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");
	this.shape_3.setTransform(191.192,176.5735);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape}]}).to({state:[{t:this.shape_1}]},7).to({state:[{t:this.shape_2}]},6).to({state:[{t:this.shape_3}]},5).to({state:[{t:this.shape_2}]},5).to({state:[{t:this.shape_1}]},5).wait(6));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,354.4,353.2);


(lib.plants2 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#CCFFCC").s().p("EAE4Aw6QAKhbAHhoIAFhVInWioQnXh0kTjgQjoi9g+jqQg2jKBTibQAlhGA5gmQA7gnBEADQDkAKDVHUQBqDqA9DoQCdCgEOB0QBVAkBWAcIBGAUQA5igiCmwQgoiHg2iSIguh3Qj7jhi8ouQg7ivgti6IgiiYIkZiAQu7n4AZlOQAIhpBphKQAggYAngRIAggNQDIgPHoKnQBfCDBOB2QiMkpAuo5QARjLAnjXIAjitQgugGh/izQiCi3hwjbQiAj8gjitQgpjNBngvQC5hVDTJaQBpEtBFE+ICfpQQm+nMh+noQgniZgCiJIAFhqQEKjwD7EoQB9CUBJDEQDaDSjYRUQhtIqiYIAQGPxgGpjQQCFhBB4AiQAlAKAfAUQAQAJAJAIQCaDkiTDpQhoCklFDxIkMDEQiZBzhdBVQj5DnAADLQAAGFFtLUQC1FqC3EcQEgzXFolmIASgSQEqkWGEEmQCoB9ikE1QghA+guBFQiIDMj8EIQiqCyjSDAQhWBPhcBRIhhBTQhiBUhMA9QEKCCgtLMQgXFmhMFMQGUsFGMjNIAcgOQCBg8BwAIQAjACAdAJIAWAJQCIB4gWCRQgKBCgrBIQhuC2k/DPQjkCTk2CRQibBJhtArIiRAYQA5g8AjkkgAoTDiQA2BTAIAJQAHAIgkg7Qgkg6gog9QAUApAXAlg");
	this.shape.setTransform(165.2213,436.1769);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#04C2F6").s().p("EgF/A2CQg+gXhNggQAWiRiIh4IgWgJQgdgJgjgCQhwgIiBA8IgcAOQh/hDhthDQlQjPh0i2Qg8heAAhWIBhhTQBchRBWhPQBcAHBlAtQGwDAG4MgQhQlMgYlmQgwrMEYiCQh1hZioiLQhIg8hEg6QAuhFAhg+QCkk1ioh+QmEkmkqEWQjgj0hoi5Qisk1Cwh9QGlkvFBExQF6FmEwTXQDAkcC/lqQGArUAAmFQAAjLkHjnQhhhViihzIkZjEQlWjxhuikQibjpCjjkQAJgIAQgJQAhgUAogKQB+giCMBBQG/DQGkRgQigoAhyoqQjkxUDmjSQBMjECEiUQEIkoEYDwIAGBqQgDCJgpCZQiEHonWHMICoJQQBIk+BvktQDepaDDBVQBsAvgsDNQgkCtiHD8Qh2DbiIC3QiGCzgxAGIAlCtQApDXASDLQAxI5iUEpQgqA9gmA6QgmA7AIgIQAIgJA5hTQAYglAVgpQBSh2BkiDQICqnDTAPIAhANQApARAiAYQBvBKAIBpQAaFOvtH4IkoCAIgkCYQgvC6g+CvQjGIukIDhIgxB3Qg5CSgqCHQiIGwA8CgIBJgUQBagcBagkQEdh0CligQBAjoBwjqQDgnUDwgKQBHgDA+AnQA8AmAnBGQBYCbg5DKQhCDqjzC9QkiDgnwB0InvCoIAFBVQAIBoALBbQAkEkA8A8g");
	this.shape_1.setTransform(382.4076,348.1769);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#CCFFCC").s().p("EAD+Aw6QAMhbAJhoIAHhVInTioQnUh0kPjgQjki9g6jqQgyjKBWibQAnhGA6gmQA8gnBDADQDkAKDMHUQBlDqA4DoQCaCgEMB0QBVAkBVAcIBFAUQA8igh5mwQgliHgziSIgsh3Qj2jhixouQg3ivgqi6IgfiYIkWiAQuxn4AglOQAJhpBrhKQAhgYAngRIAggNQDIgPHbKnQBcCDBMB2QiGkpA5o5QAVjLArjXIAnitQgugGh8izQh+i3hrjbQh7j8ggitQgljNBogvQC7hVDHJaQBjEtA+E+ICspQQm2nMhznoQgliZABiJIAIhqQEOjwD1EoQB6CUBFDEQDVDSjtRUQh4IqiiIAQGlxgGtjQQCGhBB4AiQAlAKAeAUQAQAJAJAIQCVDkiYDpQhrCklKDxIkPDEQicBzheBVQj+DngEDLQgIGFFeLUQCwFqCwEcQE5zXFulmIATgSQEwkWF+EmQClB9iqE1QgiA+gvBFQiNDMkBEIQiuCyjVDAQhYBPheBRIhiBTQhkBUhNA9QEICCg8LMQgeFmhTFMQGjsFGRjNIAcgOQCCg8BwAIQAjACAdAJIAWAJQCGB4gZCRQgMBCgtBIQhxC2lDDPQjnCTk5CRQicBJhvArIiRAYQA7g8AokkgAoSDiQAzBTAIAJQAIAIgkg7Qgig6gng9QATApAXAlg");
	this.shape_2.setTransform(172.0126,436.1769);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#04C2F6").s().p("EgGwA2CQg+gXhMggQAZiRiGh4IgWgJQgdgJgjgCQhwgIiBA8IgcAOQh+hDhshDQlMjPhxi2Qg6heADhWIBihTQBehRBXhPQBcAHBkAtQGsDAGoMgQhJlMgRlmQgirMEbiCQhzhZiliLQhHg8hDg6QAvhFAig+QCqk1ilh+Ql+kmkvEWQjcj0hki5Qimk1Czh9QGrkvE7ExQFyFmEYTXQDFkcDHlqQGOrUAImFQAEjLkCjnQhfhVighzIkWjEQlRjxhqikQiWjpCnjkQAJgIARgJQAhgUAogKQB+giCLBBQG7DQGNRgQiVoAhnoqQjOxUDqjSQBQjECHiUQEOkoETDwIAEBqQgFCJgtCZQiOHonfHMICcJQQBPk+B1ktQDqpaDBBVQBsAvgwDNQgoCtiMD8Qh6DbiMC3QiKCzgxAGIAiCtQAlDXANDLQAmI5iaEpQgsA9gmA6QgoA7AIgIQAJgJA6hTQAZglAWgpQBUh2BniDQIQqnDSAPIAhANQAoARAiAYQBtBKAGBpQAUFOv3H4IkrCAIgnCYQgzC6hBCvQjRIukNDhIgzB3Qg8CSgtCHQiRGwA5CgIBKgUQBbgcBagkQEfh0CoigQBFjoB1jqQDpnUDwgKQBHgDA+AnQA7AmAmBGQBUCbg8DKQhHDqj3C9QknDgnyB0InyCoIADBVQAGBoAJBbQAeEkA7A8g");
	this.shape_3.setTransform(389.4882,348.1769);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#CCFFCC").s().p("EAC3Aw6QAOhbAMhoIAIhVInPioQnSh0kKjgQjgi9g1jqQgtjKBZibQAohGA7gmQA9gnBDADQDkAKDBHUQBhDqAzDoQCWCgEKB0QBUAkBVAcIBEAUQBAighwmwQgiiHgxiSIgph3QjxjhilouQg0ivgmi6IgbiYIkUiAQumn4AnlOQAMhpBshKQAhgYAogRIAggNQDJgPHMKnQBaCDBJB2QiAkpBGo5QAYjLAwjXIAritQgugGh4izQh6i3hnjbQh1j8gcitQghjNBpgvQC8hVC7JaQBdEtA3E+IC4pQQmsnMhpnoQghiZADiJIALhqQETjwDvEoQB3CUBBDEQDQDSkFRUQiDIqiuIAQG+xgGxjQQCIhBB2AiQAlAKAeAUQAQAJAIAIQCRDkidDpQhvCklPDxIkTDEQieBzhhBVQkCDngIDLQgRGFFPLUQCoFqCqEcQFTzXF2lmIAUgSQE1kWF4EmQCiB9ixE1QgjA+gwBFQiRDMkHEIQiyCyjZDAQhZBPhgBRIhkBTQhmBUhOA9QEFCChMLMQglFmhaFMQG0sFGVjNIAcgOQCDg8BwAIQAjACAdAJIAWAJQCDB4gcCRQgNBCgvBIQh1C2lHDPQjqCTk9CRQidBJhwArIiRAYQA8g8AukkgAobDiQAyBTAHAJQAIAIgig7IhHh3QASApAWAlg");
	this.shape_4.setTransform(179.1234,436.1769);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#04C2F6").s().p("EgHlA2CQg+gXhLggQAciRiDh4IgWgJQgdgJgjgCQhvgIiDA8IgcAOQh9hDhrhDQlHjPhti2Qg4heAFhWIBjhTQBghRBZhPQBcAHBjAtQGoDAGXMgQhClMgKlmQgSrMEdiCQhxhZiiiLQhFg8hCg6QAxhFAjg+QCwk1iih+Ql4kmk1EWQjWj0hgi5Qigk1C1h9QGykvE0ExQFrFmD9TXQDMkcDOlqQGerUAQmFQAIjLj9jnQhdhViehzIkRjEQlMjxhnikQiRjpCsjkQAJgIARgJQAigUAogKQB/giCJBBQG3DQF2RgQiLoAhboqQi3xUDvjSQBVjECJiUQEVkoEODwIABBqQgICJgvCZQiZHonpHMICQJQQBVk+B7ktQD3paDABVQBqAvg0DNQgsCtiRD8Qh/DbiQC3QiNCzgyAGIAfCtQAgDXAJDLQAaI5igEpQgtA9goA6QgpA7AIgIQAJgJA8hTQAaglAXgpQBWh2BqiDQIeqnDSAPIAhANQAoARAhAYQBsBKADBpQANFOwCH4IkuCAIgqCYQg2C6hGCvQjdIukRDhIg1B3QhACSgvCHQibGwA2CgIBKgUQBbgcBbgkQEih0CsigQBKjoB5jqQD0nUDwgKQBHgDA8AnQA7AmAkBGQBRCbhADKQhMDqj7C9QksDgn0B0In2CoIABBVQAEBoAHBbQAYEkA6A8g");
	this.shape_5.setTransform(395.9658,348.1769);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#CCFFCC").s().p("EABxAw6QAQhbAOhoIAKhVInMioQnQh0kFjgQjbi9gwjqQgqjKBdibQAqhGA7gmQA+gnBDADQDjAKC4HUQBcDqAuDoQCTCgEIB0QBSAkBVAcIBEAUQBDighnmwQgfiHguiSIgnh3QjsjhiZouQgwivgii6IgZiYIkQiAQucn4AulOQAOhpBuhKQAigYAogRIAggNQDJgPG+KnQBXCDBHB2Qh6kpBSo5QAdjLA0jXIAvitQgvgGhzizQh3i3hijbQhvj8gZitQgdjNBrgvQC9hVCuJaQBXEtAwE+IDFpQQminMhfnoQgeiZAGiJIANhqQEYjwDpEoQB0CUA8DEQDNDSkdRUQiPIqi4IAQHVxgG1jQQCKhBB1AiQAlAKAeAUQAPAJAIAIQCMDkiiDpQhyCklUDxIkZDEQifBzhiBVQkIDngMDLQgZGFE/LUQChFqCkEcQFtzXF+lmIAUgSQE7kWFyEmQCfB9i3E1QgkA+gyBFQiWDMkMEIQi1CyjeDAQhbBPhhBRIhmBTQhnBUhQA9QECCChbLMQgsFmhhFMQHEsFGZjNIAdgOQCEg8BvAIQAjACAdAJIAWAJQCAB4gfCRQgOBCgwBIQh5C2lMDPQjtCTk/CRQifBJhxArIiRAYQA8g8A1kkgAokDiQAwBTAHAJQAIAIghg7IhEh3QARApAVAlg");
	this.shape_6.setTransform(186.3619,436.1769);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#04C2F6").s().p("EgIZA2CQg9gXhLggQAfiRiAh4IgWgJQgdgJgjgCQhvgIiEA8IgdAOQh7hDhphDQlDjPhpi2Qg2heAGhWIBmhTQBhhRBbhPQBbAHBiAtQGlDAGFMgQg7lMgClmQgDrMEgiCQhvhZifiLQhEg8hAg6QAyhFAkg+QC3k1ifh+Qlykmk7EWQjRj0hci5QiZk1C3h9QG4kvEuExQFkFmDiTXQDSkcDWlqQGtrUAYmFQANjLj4jnQhchVibhzIkNjEQlHjxhjikQiMjpCwjkQAKgIARgJQAigUAogKQCAgiCIBBQGyDQFeRgQiAoAhPoqQifxUDzjSQBZjECMiUQEbkoEJDwIgBBqQgLCJgyCZQijHonzHMICDJQQBck+CCktQEDpaC+BVQBqAvg5DNQgvCtiXD8QiDDbiUC3QiRCzgyAGIAbCtQAcDXAEDLQAOI5imEpQgvA9gpA6QgqA7AJgIQAIgJA+hTQAbglAYgpQBZh2BsiDQItqnDRAPIAhANQAnARAhAYQBqBKABBpQAGFOwNH4IkwCAIgtCYQg7C6hJCvQjpIukVDhIg4B3QhDCSgyCHQikGwAyCgIBLgUQBcgcBcgkQEkh0CvigQBPjoB+jqQD+nUDwgKQBHgDA8AnQA6AmAiBGQBOCbhFDKQhQDqkAC9QkwDgn3B0In5CoIgBBVQACBoAFBbQAREkA5A8g");
	this.shape_7.setTransform(402.5715,348.1769);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_3},{t:this.shape_2}]},9).to({state:[{t:this.shape_5},{t:this.shape_4}]},10).to({state:[{t:this.shape_7},{t:this.shape_6}]},10).to({state:[{t:this.shape_5},{t:this.shape_4}]},10).to({state:[{t:this.shape_3},{t:this.shape_2}]},10).wait(10));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,585.9,784.4);


(lib.plants1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#323232").ss(3,1,1).p("AGDAaQjsg4kCAFQiKACiNAV");
	this.shape.setTransform(202.6,840.505);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FE742F").s().p("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");
	this.shape_1.setTransform(362.1105,421.5792);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().s("#323232").ss(3,1,1).p("AGDAaQjrg4kCAFQiKACiOAV");
	this.shape_2.setTransform(202.675,840.505);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FE742F").s().p("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");
	this.shape_3.setTransform(374.2738,421.5792);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f().s("#323232").ss(3,1,1).p("AGDAaQjqg4kDAFQiJACiPAV");
	this.shape_4.setTransform(202.65,840.505);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#FE742F").s().p("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");
	this.shape_5.setTransform(386.3597,421.5792);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f().s("#323232").ss(3,1,1).p("AGCAaQjog4kDAFQiJACiPAV");
	this.shape_6.setTransform(202.625,840.505);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#FE742F").s().p("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");
	this.shape_7.setTransform(396.0355,421.5792);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_3},{t:this.shape_2}]},6).to({state:[{t:this.shape_5},{t:this.shape_4}]},7).to({state:[{t:this.shape_7},{t:this.shape_6}]},7).to({state:[{t:this.shape_5},{t:this.shape_4}]},7).to({state:[{t:this.shape_3},{t:this.shape_2}]},7).wait(7));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,767.9,844.7);


(lib.happy_mouth_talk = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("AR8F4QBWngAalyQAemmg3jOQgQg6gWgpIgCgBQhLA0hXAwQjsCDlHBpQt9EitOjxIAmDaQA5ENBlD+QDSITFTFQQC0CzDXB6ICZA4QC7A3CrAAQIgAACqopQAXhsAdimQiUjDi9hKQkxh3jBFwQgvBagoB3AE5FkQiCiwipgjQlUhEjGLK");
	this.shape.setTransform(127.0299,120.3);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FF0000").s().p("AkfH7Iiag3QjXh7i0iyQDGrJFVBEQCqAiCACxQgtBagoB2QAoh2AthaQDBlxExB4QC9BKCUDDQgdCmgXBrQiqIpogAAQiqAAi7g4g");
	this.shape_1.setTransform(158.2,184.3384);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FF99FF").s().p("AwxCBQhlj9g5kNIgmjaQNODxN9khQFHhqDsiCQBXgxBLg0IACACQAWAoAQA7QA3DNgeGmQgaFxhWHhQiUjDi9hKQkxh4jBFyQiCixipgjQlUhEjGLKQlTlQjSoUg");
	this.shape_2.setTransform(127.0299,99.7);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f().s("rgba(0,0,0,0.839)").ss(6,1,1).p("ATRj2QkWDAnACPQt8EitPjx");
	this.shape_3.setTransform(123.275,24.7242);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_3}]},5).wait(5));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-3,-3,258.6,245.1);


(lib.happy_mouth_sailence = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("AR8F4QBWngAalyQAemmg3jOQgQg6gWgpIgCgBQhLA0hXAwQjsCDlHBpQt9EitOjxIAmDaQA5ENBlD+QDSITFTFQQC0CzDXB6ICZA4QC7A3CrAAQIgAACqopQAXhsAdimgAE5FkQDIlDD3A5QBBAPBEApQB6BJCFCdAE5FkQgvBagoB3AE5FkQiCiwipgjQlUhEjGLK");
	this.shape.setTransform(127.0294,120.05);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FF0000").s().p("AkfH7Iiag3QjXh7i0iyQDGrJFVBEQCqAiCACxQgtBagoB2QAoh2AthaIAIgMQCmkGDIgBIAAAAIAAAAQAjAAAjAIIAAAAIAEABQAZAHAZAKQAqAQApAXQCMBOByCYQiEidh6hJQB6BJCECdQgdCmgXBrQiqIpogAAQiqAAi7g4gAHBolIgEgBIAAAAQgjgIgjAAIAAAAIAAAAQjIABimEGIgIAMQCxlSEPBIgAHBolIAAAAg");
	this.shape_1.setTransform(158.2,184.0905);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FF99FF").s().p("AwxCBQhlj8g5kOIgmjaQNODxN9kiQFHhoDsiDQBXgxBLg0IACACQAWApAQA6QA3DNgeGnQgaFwhWHhQhziXiMhPQhEgphBgPQkOhIixFSQiCixipghQlUhFjGLKQlTlQjSoUgAMrE5QgagKgZgHQBBAPBEApQgogWgqgRgAL4EoIAAAAg");
	this.shape_2.setTransform(127.0294,99.45);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.happy_mouth_sailence, new cjs.Rectangle(-1.5,-1.7,257.1,243.6), null);


(lib.fish2_talk = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FFFFFF").ss(3,1,1).p("AJ5BVQAABQg5A5Qg5A5hQAAQhQAAg5g5Qg4g5AAhQQAAhQA4g4QA5g4BQAAQBQAAA5A4QA5A4AABQgAmFicQAAAygjAkQgkAjgyAAQgzAAgjgjQgkgkAAgyQAAgzAkgjQAjgkAzAAQAyAAAkAkQAjAjAAAzg");
	this.shape.setTransform(285.425,171.025);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#000000").ss(3,1,1).p("EgshAW4IB0BmQCbB8C9BtQEHCXEdBhQF0B/GaAkQLIA9L0jgQFDhfFMiUQVrpqWv3ZIBQBcQBkBwBoBiQFLE2DtAxQgdjLhPjeQidm+j2hiIBdhvQBviTBaitQD9nrgEocQgBhEgEhFQgigIg8AJQh3ASiDBWQgXAPgXARQmKEillMlQi3AGi4AGQijAGijAHQjHAJjJAKQj2ANj5APQgFAAgGABQinAKioAMQACAKFNggAXC0uIBCgUQBSgVBOgGQD5gSB4CPQAVAaAOAaIBIADQBCgTBCgJQDUgcCKBQQAmAQAUAPQA9AwhsAnQiQAzAaA6EAgVgTgQBFCGjfBFQjeBFARBVQhQAFhQAGQl/AblBAeQmBAkkpAoQhwAPhjAPQiFAVhvAWQmjBThmA9QgPgjgYgrQhIiEhihbQk5kgnBDuQglAZguAqQgDgHgEgHQh3jIihhEQkOhxlMD4QhHAng9BjQh7DFAxEnEAhCAMTQgYCEgtBWI22ikQUzx6CQh8IAbCqQAHA2AHA2QARCFAKB+QABARABARQAdGSgrDzgEAzNgPOQAKAKlQADEAqcgRyIA0gCQBOAABMALQDiAhCBB6EApigSRQAZAPAWARIALgBAOIz5IAhgQQBKgfBJgVQDphBCdBQQixBdicBzQk3DmAQBBAOMz7IgEACANuzvQALgDAMgGQAAAAABAAQABgBABAAANuzvQkBBoicB0QkUDPgZBZAOMz7QgQAGgOAGAOMz7QiyiZj2BhQjTB/jLCRQmSEhApBgAgmkwIAwA3QA7BGA6BQQC4D/BdD+QCBFjhKEuQhcF5mVEOEghdgFLQgbESESD2IAzAuQA2ASA7ANQC7AqChgcQDhgmCMisQCqjPAjmJA9KsuQgLAKgLAKQh1BxhBB9Qg8BzgLBuIs0AAQmMAKmrAbQtWA1iXBXICKCuQCwDSC9CwQJbIyHmAeIgnBJQg1B1gFBZQgIB8BUA0QBsBCEFg3EgpqAGZIBRgTQBhgSBRAHQgDATgnAtQhPBainCMQhoBYhoBJQjQCUhWAQEglCAF/IgTA/QgYBNgeBLQhgDxhyB/QgxBJhWBfQisC+i5BrIhJAWEglnAF7QATABASADQBcAPA5AyEglCAF/QAEK2njGDAaOIPIGji+AYlLGIHyhvAZ0MbIHOgIAZGGsIIIlAAXDF+IJwoV");
	this.shape_1.setTransform(479.0031,222.2992);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("rgba(255,255,255,0.839)").s().p("AEuDeQg4g5AAhQQAAhQA4g4QA5g4BQAAQBQAAA5A4QA5A4AABQQAABQg5A5Qg5A5hQAAQhQAAg5g5gApUhGQgkgkAAgyQAAgzAkgjQAjgkAzAAQAyAAAkAkQAjAjAAAzQAAAygjAkQgkAjgyAAQgzAAgjgjg");
	this.shape_2.setTransform(285.425,171.025);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("rgba(0,0,0,0.839)").s().p("ACjKvQg7gNg2gTIgygtQkSj3AckSQAKhuA8hzQBBh9B1hwIAVgUIgVAUQh1BwhBB9Qg8BzgKBuIs0AAQgxknB6jFQA+hiBHgoQFMj4EOByQChBEB2DHIAGAPQAugqAlgZQHCjvE4EhQBiBaBICEQAYArAPAkQgiGIiqDQQiMCrjiAnQhAALhEAAQhnAAhxgZgAEFiPQg5A5AABQQAABPA5A5QA5A5BQAAQBQAAA4g5QA5g5AAhPQAAhQg5g5Qg4g4hQAAQhQAAg5A4gAp+lOQgjAjAAAzQAAAyAjAkQAkAjAyAAQAzAAAjgjQAkgkAAgyQAAgzgkgjQgjgkgzAAQgyAAgkAkg");
	this.shape_3.setTransform(289.575,180.2162);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("rgba(153,255,204,0.839)").s().p("EgzVATWQAGhZA1h0IAmhJQBWgRDQiTQBohKBohXQCoiMBOhbQAogtACgTQATACASADIgSA+QgZBOgdBLQhgDwhzB/QgxBKhWBfQisC+i4BqIhKAWQhUgzAIh9gAJRMjIXDz3IAaCqIAPBsIpxIWIJxoWQAQCFAKB/IoIFAIIIlAIADAiQAcGRgrDzInOAJIHOgJQgYCFgtBVgAYvKgIHyhwgAaXHoIGki+gEAhLALsIAAAAgABQxKQDLiRDTh+QD1hiCyCZIgeAMQkABoicB1QkUDPgZBYQhxAPhiAQQiGAVhuAWQgqhgGTkigAHbw5QCch1EAhoQAMgDALgFIACgBIABgBIAigPQBJggBJgUQDqhCCdBRIBCgUQBSgVBNgGQD6gSB3CPQARAgAAAcQgBBaipA1QjOA/AABOIABAMIigALQl/AclBAeIgBgHQAAhFEojcQCbhzCyhcQiyBcibBzQkoDcAABFIABAHQmCAkkoAnQAZhYEUjPgAa3uuQAAhODOg/QCpg1ABhaQAAgcgRggQAVAaAOAZIBJADQBBgSBDgJQDUgcCKBPQAZAPAVARIALAAQAXARAAAQQgBAdhFAZQh6ArAAAwQAAAJAEAJQj2AMj4AQIgLAAIlPAWIgBgMgEAoAgPUQgEgJAAgJQAAgwB6grQBFgZABgdQAAgQgXgRIA0gCQBPgBBMALQDhAiCBB6IlGANQjHAIjJALIAAAAgEAqlgSYIAAAAgEAgegUGIAAAAg");
	this.shape_4.setTransform(478.0652,226.1244);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#FF6699").s().p("EgQjAiiQmagkl0h/QkdhhkHiXQi9htibh8Ih0hmQHfmAAAqrIAAgOQBcAPA5AyQg5gyhcgPQgSgDgTgBIgDgBIAAAAQgUgBgWAAIAAAAIgBAAQg8AAhFAMIgDABIhRATIBRgTIADgBQBFgMA8AAIABAAIAAAAQAWAAAUABIAAAAIADABQgDATgnAtQhPBainCMQhoBYhoBJQjQCUhWAQQnmgepboyQi9iwiwjSIiKiuQCXhXNWg1QGrgbGMgKIM0AAQgbESESD2IAzAuQA2ASA7ANQC7AqChgcQDhgmCMisQCqjPAjmJQBmg9GjhTQBvgWCFgVQBjgPBwgPQEpgoGBgkQFBgeF/gbICggLQACAKFNggIALgBQD5gPD2gNQDJgKDHgJQFQgDgKgKIFvgMQFlslGKkiQAXgRAXgPQCDhWB3gSQA8gJAiAIQAEBFABBEQAEIcj9HrQhaCthvCTIhdBvQD2BiCdG+QBPDeAdDLQjtgxlLk2QhohihkhwIhQhcQ2vXZ1rJqQlMCUlDBfQpRCwo2AAQibAAiagNgAHLQrQhcF5mVEOQGVkOBcl5QAbhuAAh1QAAjMhSjiQhdj+i4j/Qg6hQg7hGIgwg3IAwA3QA7BGA6BQQC4D/BdD+QBSDiAADMQAAB1gbBugAJHNJIW2CkQAthWAYiEQArjzgdmSIgCgiQgKh+gRiFIgOhsIgbiqI3DT2gEgySAWtIBJgWQC5hrCsi+QBWhfAxhJQByh/BgjxQAehLAYhNIATg/IAAAOQAAKrnfGAQh3AZhXAAQhoAAg7gkg");
	this.shape_5.setTransform(479.0031,222.2992);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f().s("#000000").ss(3,1,1).p("EgquAYMQBbBXAmAbQBmBHByBCQEHCXEdBhQF0B/GaAkQLIA9L0jgQFDhfFMiUQVrpqWv3ZIBQBcQBkBwBoBiQFLE2DtAxQgdjLhPjeQidm+j2hiIBdhvQBviTBaitQD9nrgEocQgBhEgEhFQgigIg8AJQh3ASiDBWQgXAPgXARQmKEillMlQi3AGi4AGQAKAKlQADQjHAJjJAKQj2ANj5APQgFAAgGABQinAKioAMQACAKFNggAXC0uIBCgUQBSgVBOgGQD5gSB4CPQAVAaAOAaIBIADQBCgTBCgJQDUgcCKBQQAZAPAWARIALgBQA9AwhsAnQiQAzAaA6EAgVgTgQBFCGjfBFQjeBFARBVQhQAFhQAGQl/AblBAeQmBAkkpAoQhwAPhjAPQiFAVhvAWQmjBThmA9QgPgjgYgrQhIiEhihbQk5kgnBDuQglAZguAqQgDgHgEgHQh3jIihhEQkOhxlMD4QhHAng9BjQh7DFAxEnEAhCAMTQgYCEgtBWI22ikQUzx6CQh8IAbCqQAHA2AHA2QARCFAKB+QABARABARQAdGSgrDzgEAqcgRyIA0gCQBOAABMALQDiAhCBB6QijAGijAHEApigSRQAmAQAUAPANuzvQALgDAMgGQAAAAABAAQABgBABAAAOMz7IgEACIAhgQQBKgfBJgVQDphBCdBQQixBdicBzQk3DmAQBBANuzvQkBBoicB0QkUDPgZBZAOMz7QiyiZj2BhQjTB/jLCRQmSEhApBgAOMz7QgQAGgOAGAgmkwIAwA3QA7BGA6BQQC4D/BdD+QCBFjhKEuQhcF5mVEOEghdgFLQgbESESD2IAzAuQA2ASA7ANQC7AqChgcQDhgmCMisQCqjPAjmJA9KsuQgLAKgLAKQh1BxhBB9Qg8BzgLBuIs0AAQmMAKmrAbQtWA1iXBXICKCuQCwDSC9CwQBqBiBlBSQHVF5GIAiQADAAACAAQAIABAIAAEgmFAGHQABAUggAyQgCADgCAEQhABkiLCgQhZBmhbBZQiSCPhMAwIgxBcQgiB7AIBZQAMB8BbAmQBpArDShHQAZgJATgKQAUgNALgMQA2g/AthDQEImLhKocQgEgagEgaIgJBBQgMBQgRBPQg5D9heCPQglBQhGBrQiMDXilCGIhGAhEgmFAGHQADgBACAAQAEAAAEAAQAegDAQAAEgpqAGZIBRgTQBVgQBIADIAAABEgmFAGHQh9CkiWCFQhxBjh/BRQhtBGh4A4EglCAF/QBcAPA5AyAXDF+IJwoVAZGGsIIIlAAZ0MbIHOgIAYlLGIHyhvAaOIPIGji+");
	this.shape_6.setTransform(479.0031,222.2992);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("rgba(153,255,204,0.839)").s().p("EgyNAUiQgIhZAih7IAxhcQA8gQC3iyQBbhZBZhmQCQilA/hmIAMgVQAJgVgDgNQgCgHgGgFIAFAAIAIgBQAegDAQAAIgJBBQgMBQgRBPQg5D9heCPQglBQhGBrQiMDXilCGIhGAhQhbgmgMh8gAIKLlIXDz2IAbCqIAOBsQARCFAKB+IACAiQAdGSgrDzInOAIIHOgIQgYCEgtBWgAXoJiIHyhvgAZRGrIGji+gAYJFIIIIlAgAWGEaIJwoVgAAJyHQDLiRDTh/QD2hhCyCZIgeAMQkBBoicB0QkUDPgZBZQAZhZEUjPQCch0EBhoQALgDAMgGIABAAIACgBIAhgQQBKgfBJgVQDphBCdBQIBCgUQBSgVBOgGQD5gSB4CPQAVAaAOAaIBIADQBCgTBCgJQDUgcCKBQQAZAPAWARIALgBQAWASAAAQQAAAchFAZQh7ArABAxQAAAIAEAJQj2ANj5APIgLABIlPAWIgBgNQAAhNDOhAQCpg0ABhbQAAgcgQggQAQAgAAAcQgBBbipA0QjOBAAABNIABANIigALQl/AblBAeIgBgGQAAhGEojbQCchzCxhdQixBdicBzQkoDbAABGIABAGQmBAkkpAoQhvAPhkAPQiFAVhvAWQgphgGSkhgEAm6gQSQgEgJAAgIQgBgxB7grQBFgZAAgcQAAgQgWgSIA0gCQBOAABMALQDiAhCBB6IlGANQjHAJjJAKIAAAAg");
	this.shape_7.setTransform(485.1488,232.2744);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#FF6699").s().p("EgQjAiiQmagkl0h/QkdhhkHiXQhyhChmhHQgmgbhbhXQAZgJATgKQAUgNALgMQgLAMgUANQgTAKgZAJQjSBHhpgrIBGghQCliGCMjXQBGhrAlhQQBeiPA5j9QARhPAMhQIAJhBIAIA0IAAg4QBcAPA5AyQg5gyhcgPQgSgDgogCIAAgBIgCAAIgKAAIgMAAIAAAAIgBAAQg6AAhCALIgIACIhRATIBRgTIAIgCQBCgLA6AAIABAAIAAAAIAMAAIAKAAIACAAIAAABQAEAEABAFIgMAAIADADIgFABIAAAAIAAABQAAAVgfAwIgEAHIAEgHQAfgwAAgVIAAgBIAAAAQAGAEACAIQAAAMgLARIgJALIgXAZQhOBUiRB5IgRAPQCWiFB9ikQh9CkiWCFQhgBPhfBDIgxAiQhtBGh4A4IgEABIgMADIgQgBIgFAAQmIginVl5QhlhShqhiQi9iwiwjSIiKiuQCXhXNWg1QGrgbGMgKIM0AAQgbESESD2IAzAuQA2ASA7ANQC7AqChgcQDhgmCMisQCqjPAjmJQBmg9GjhTQBvgWCFgVQBjgPBwgPQEpgoGBgkQFBgeF/gbICggLQACAKFNggIALgBQD5gPD2gNQDJgKDHgJQFQgDgKgKIFvgMQFlslGKkiQAXgRAXgPQCDhWB3gSQA8gJAiAIQAEBFABBEQAEIcj9HrQhaCthvCTIhdBvQD2BiCdG+QBPDeAdDLQjtgxlLk2QhohihkhwIhQhcQ2vXZ1rJqQlMCUlDBfQpRCwo2AAQibAAiagNgAHLQrQhcF5mVEOQGVkOBcl5QAbhuAAh1QAAjMhSjiQhdj+i4j/Qg6hQg7hGIgwg3IAwA3QA7BGA6BQQC4D/BdD+QBSDiAADMQAAB1gbBugEgpjAXgQBAgzAjhPQDOk1AAmNQAAhvgQh2QAQB2AABvQAAGNjOE1QgtBDg2A/IAAAAgAJHNJIW2CkQAthWAYiEQArjzgdmSIgCgiQgKh+gRiFIgOhsIgbiqI3DT2gEgxtAPiIAAAAgEguIANkQiZBohMAWQB4g4BthGgEguIANkIAAAAgEgqYAKwIAAAAgEglCAF/IAAAAgEgl8AF6IAAAAg");
	this.shape_8.setTransform(479.0031,222.2992);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_8},{t:this.shape_7},{t:this.shape_3},{t:this.shape_2},{t:this.shape_6},{t:this.shape}]},14).wait(13));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1.5,-1.5,961,447.6);


(lib.fish2_sailence = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FFFFFF").ss(3,1,1).p("AJ5BVQAABQg5A5Qg5A5hQAAQhQAAg5g5Qg4g5AAhQQAAhQA4g4QA5g4BQAAQBQAAA5A4QA5A4AABQgAmFicQAAAygjAkQgkAjgyAAQgzAAgjgjQgkgkAAgyQAAgzAkgjQAjgkAzAAQAyAAAkAkQAjAjAAAzg");
	this.shape.setTransform(285.425,171.025);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#000000").ss(3,1,1).p("EgshAW4IB0BmQCbB8C9BtQEHCXEdBhQF0B/GaAkQLIA9L0jgQFDhfFMiUQVrpqWv3ZIBQBcQBkBwBoBiQFLE2DtAxQgdjLhPjeQidm+j2hiIBdhvQBviTBaitQD9nrgEocQgBhEgEhFQgigIg8AJQh3ASiDBWQgXAPgXARQmKEillMlQi3AGi4AGQAKAKlQADQjHAJjJAKQj2ANj5APQgFAAgGABQinAKioAMQACAKFNggAXC0uIBCgUQBSgVBOgGQD5gSB4CPQAVAaAOAaIBIADQBCgTBCgJQDUgcCKBQQAmAQAUAPIA0gCQBOAABMALQDiAhCBB6QijAGijAHEAgVgTgQBFCGjfBFQjeBFARBVQhQAFhQAGQl/AblBAeQmBAkkpAoQhwAPhjAPQiFAVhvAWQmjBThmA9QgPgjgYgrQhIiEhihbQk5kgnBDuQglAZguAqQgDgHgEgHQh3jIihhEQkOhxlMD4QhHAng9BjQh7DFAxEnEAhCAMTQgYCEgtBWI22ikQUzx6CQh8IAbCqQAHA2AHA2QARCFAKB+QABARABARQAdGSgrDzgEAqcgRyQA9AwhsAnQiQAzAaA6EApigSRQAZAPAWARIALgBANuzvQALgDAMgGQAAAAABAAQABgBABAAAOMz7IgEACIAhgQQBKgfBJgVQDphBCdBQQixBdicBzQk3DmAQBBANuzvQkBBoicB0QkUDPgZBZAOMz7QgQAGgOAGAOMz7QiyiZj2BhQjTB/jLCRQmSEhApBgAgmkwIAwA3QA7BGA6BQQC4D/BdD+QCBFjhKEuQhcF5mVEOEghdgFLQgbESESD2IAzAuQA2ASA7ANQC7AqChgcQDhgmCMisQCqjPAjmJA9KsuQgLAKgLAKQh1BxhBB9Qg8BzgLBuIs0AAQmMAKmrAbQtWA1iXBXICKCuQCwDSC9CwQJbIyHmAeIgnBJQg1B1gFBZQgIB8BUA0QBsBCEFg3EglnAF7QATABASADIgTA/QgYBNgeBLQhgDxhyB/QgxBJhWBfQisC+i5BrIhJAWEglnAF7QgDATgnAtQhPBainCMQhoBYhoBJQjQCUhWAQEgpqAGZIBRgTQBhgSBRAHEglCAF/QAEK2njGDEglCAF/QBcAPA5AyAXDF+IJwoVAZGGsIIIlAAZ0MbIHOgIAYlLGIHyhvAaOIPIGji+");
	this.shape_1.setTransform(479.0031,222.2992);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("rgba(255,255,255,0.839)").s().p("AEuDeQg4g5AAhQQAAhQA4g4QA5g4BQAAQBQAAA5A4QA5A4AABQQAABQg5A5Qg5A5hQAAQhQAAg5g5gApUhGQgkgkAAgyQAAgzAkgjQAjgkAzAAQAyAAAkAkQAjAjAAAzQAAAygjAkQgkAjgyAAQgzAAgjgjg");
	this.shape_2.setTransform(285.425,171.025);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("rgba(0,0,0,0.839)").s().p("ACjKvQg7gNg2gTIgygtQkSj3AckSQAKhuA8hzQBBh9B1hwIAVgUIgVAUQh1BwhBB9Qg8BzgKBuIs0AAQgxknB6jFQA+hiBHgoQFMj4EOByQChBEB2DHIAGAPQAugqAlgZQHCjvE4EhQBiBaBICEQAYArAPAkQgiGIiqDQQiMCrjiAnQhAALhEAAQhnAAhxgZgAEFiPQg5A5AABQQAABPA5A5QA5A5BQAAQBQAAA4g5QA5g5AAhPQAAhQg5g5Qg4g4hQAAQhQAAg5A4gAp+lOQgjAjAAAzQAAAyAjAkQAkAjAyAAQAzAAAjgjQAkgkAAgyQAAgzgkgjQgjgkgzAAQgyAAgkAkg");
	this.shape_3.setTransform(289.575,180.2162);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("rgba(153,255,204,0.839)").s().p("EgzVATWQAGhZA1h0IAmhJQBWgRDQiTQBohKBohXQCoiMBOhbQAogtACgTQATACASADIgSA+QgZBOgdBLQhgDwhzB/QgxBKhWBfQisC+i4BqIhKAWQhUgzAIh9gAJRMjIXDz3IAaCqIAPBsQAQCFAKB/IADAiQAcGRgrDzInOAJIHOgJQgYCFgtBVgAYvKgIHyhwgAaXHoIGki+gAZPGGIIIlAgAXMFYIJxoWgABQxKQDLiRDTh+QD1hiCyCZIgeAMQkABoicB1QkUDPgZBYQAZhYEUjPQCch1EAhoQAMgDALgFIACgBIABgBIAigPQBJggBJgUQDqhCCdBRIBCgUQBSgVBNgGQD6gSB3CPQAVAaAOAZIBJADQBBgSBDgJQDUgcCKBPQAZAPAVARIALAAQAXARAAAQQgBAdhFAZQh6ArAAAwQAAAJAEAJQj2AMj4AQIgLAAIlPAWIgBgMQAAhODOg/QCpg1ABhaQAAgcgRggQARAgAAAcQgBBaipA1QjOA/AABOIABAMIigALQl/AclBAeIgBgHQAAhFEojcQCbhzCyhcQiyBcibBzQkoDcAABFIABAHQmCAkkoAnQhxAPhiAQQiGAVhuAWQgqhgGTkigEAoAgPUQgEgJAAgJQAAgwB6grQBFgZABgdQAAgQgXgRIA0gCQBPgBBMALQDhAiCBB6IlGANQjHAIjJALIAAAAg");
	this.shape_4.setTransform(478.0652,226.1244);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#FF6699").s().p("EgQjAiiQmagkl0h/QkdhhkHiXQi9htibh8Ih0hmQHfmAAAqrIAAgOQBcAPA5AyQg5gyhcgPIAAAOQAAKrnfGAQkFA3hshCIBJgWQC5hrCsi+QBWhfAxhJQByh/BgjxQAehLAYhNIATg/QgSgDgTgBIgDgBIAAAAQgUgBgWAAIAAAAIgBAAQg8AAhFAMIgDABIhRATIBRgTIADgBQBFgMA8AAIABAAIAAAAQAWAAAUABIAAAAIADABQgDATgnAtQhPBainCMQhoBYhoBJQjQCUhWAQQnmgepboyQi9iwiwjSIiKiuQCXhXNWg1QGrgbGMgKIM0AAQgbESESD2IAzAuQA2ASA7ANQC7AqChgcQDhgmCMisQCqjPAjmJQBmg9GjhTQBvgWCFgVQBjgPBwgPQEpgoGBgkQFBgeF/gbICggLQACAKFNggIALgBQD5gPD2gNQDJgKDHgJQFQgDgKgKIFvgMQFlslGKkiQAXgRAXgPQCDhWB3gSQA8gJAiAIQAEBFABBEQAEIcj9HrQhaCthvCTIhdBvQD2BiCdG+QBPDeAdDLQjtgxlLk2QhohihkhwIhQhcQ2vXZ1rJqQlMCUlDBfQpRCwo2AAQibAAiagNgAHLQrQhcF5mVEOQGVkOBcl5QAbhuAAh1QAAjMhSjiQhdj+i4j/Qg6hQg7hGIgwg3IAwA3QA7BGA6BQQC4D/BdD+QBSDiAADMQAAB1gbBugAJHNJIW2CkQAthWAYiEQArjzgdmSIgCgiQgKh+gRiFIgOhsIgbiqI3DT2gEglnAF7IAAAAg");
	this.shape_5.setTransform(479.0031,222.2992);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#FF6699").s().p("EgQjAiiQmagkl0h/QkdhhkHiXQi9htibh8Ih0hmQHfmAAAqrIAAgOQBcAPA5AyQg5gyhcgPIAAAOQAAKrnfGAQkFA3hshCIBJgWQC5hrCsi+QBWhfAxhJQByh/BgjxQAehLAYhNIATg/QgSgDgTgBIgDgBIAAAAQgUgBgWAAIAAAAIgBAAQg4AAhAAKIgEABIgFABIgDABIhRATIBRgTIADgBIAFgBIAEgBQBAgKA4AAIABAAIAAAAQAWAAAUABIAAAAIADABQgDATgnAtQhPBainCMQhoBYhoBJQjQCUhWAQQnmgepboyQi9iwiwjSIiKiuQCXhXNWg1QGrgbGMgKIM0AAQgbESESD2IAzAuQA2ASA7ANQC7AqChgcQDhgmCMisQCqjPAjmJQBmg9GjhTQBvgWCFgVQBjgPBwgPQEpgoGBgkQFBgeF/gbICggLQACAKFNggIALgBQD5gPD2gNQDJgKDHgJQFQgDgKgKIFvgMQFlslGKkiQAXgRAXgPQCDhWB3gSQA8gJAiAIQAEBFABBEQAEIcj9HrQhaCthvCTIhdBvQD2BiCdG+QBPDeAdDLQjtgxlLk2QhohihkhwIhQhcQ2vXZ1rJqQlMCUlDBfQpRCwo2AAQibAAiagNgAHLQrQhcF5mVEOQGVkOBcl5QAbhuAAh1QAAjMhSjiQhdj+i4j/Qg6hQg7hGIgwg3IAwA3QA7BGA6BQQC4D/BdD+QBSDiAADMQAAB1gbBugAJHNJIW2CkQAthWAYiEQArjzgdmSIgCgiQgKh+gRiFIgOhsIgbiqI3DT2gEglnAF7IAAAAg");
	this.shape_6.setTransform(479.0031,220.1992);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#FF6699").s().p("EgQjAiiQmagkl0h/QkdhhkHiXQi9htibh8Ih0hmQHfmAAAqrIAAgOQBcAPA5AyQg5gyhcgPIAAAOQAAKrnfGAQkFA3hshCIBJgWQC5hrCsi+QBWhfAxhJQByh/BgjxQAehLAYhNIATg/QgSgDgTgBIgFgBIgogBIAAAAIgBAAQg2AAg+AKIgHABIAAAAIgGABIgDABIhRATIBRgTIADgBIAGgBIAAAAIAHgBQA+gKA2AAIABAAIAAAAIAoABIAFABQgDATgnAtQhPBainCMQhoBYhoBJQjQCUhWAQQnmgepboyQi9iwiwjSIiKiuQCXhXNWg1QGrgbGMgKIM0AAQgbESESD2IAzAuQA2ASA7ANQC7AqChgcQDhgmCMisQCqjPAjmJQBmg9GjhTQBvgWCFgVQBjgPBwgPQEpgoGBgkQFBgeF/gbICggLQACAKFNggIALgBQD5gPD2gNQDJgKDHgJQFQgDgKgKIFvgMQFlslGKkiQAXgRAXgPQCDhWB3gSQA8gJAiAIQAEBFABBEQAEIcj9HrQhaCthvCTIhdBvQD2BiCdG+QBPDeAdDLQjtgxlLk2QhohihkhwIhQhcQ2vXZ1rJqQlMCUlDBfQpRCwo2AAQibAAiagNgAHLQrQhcF5mVEOQGVkOBcl5QAbhuAAh1QAAjMhSjiQhdj+i4j/Qg6hQg7hGIgwg3IAwA3QA7BGA6BQQC4D/BdD+QBSDiAADMQAAB1gbBugAJHNJIW2CkQAthWAYiEQArjzgdmSIgCgiQgKh+gRiFIgOhsIgbiqI3DT2gEglnAF7IAAAAg");
	this.shape_7.setTransform(479.0031,218.0992);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f().s("#000000").ss(3,1,1).p("EgshAW4IB0BmQCbB8C9BtQEHCXEdBhQF0B/GaAkQLIA9L0jgQFDhfFMiUQVrpqWv3ZIBQBcQBkBwBoBiQFLE2DtAxQgdjLhPjeQidm+j2hiIBdhvQBviTBaitQD9nrgEocQgBhEgEhFQgigIg8AJQh3ASiDBWQgXAPgXARQmKEillMlQi3AGi4AGQAKAKlQADQjHAJjJAKQj2ANj5APQgFAAgGABQinAKioAMQACAKFNggAXC0uIBCgUQBSgVBOgGQD5gSB4CPQAVAaAOAaIBIADQBCgTBCgJQDUgcCKBQQAZAPAWARIALgBIA0gCQBOAABMALQDiAhCBB6QijAGijAHEAgVgTgQBFCGjfBFQjeBFARBVQhQAFhQAGQl/AblBAeQmBAkkpAoQhwAPhjAPQiFAVhvAWQmjBThmA9QgPgjgYgrQhIiEhihbQk5kgnBDuQglAZguAqQgDgHgEgHQh3jIihhEQkOhxlMD4QhHAng9BjQh7DFAxEnEAhCAMTQgYCEgtBWI22ikQUzx6CQh8IAbCqQAHA2AHA2QARCFAKB+QABARABARQAdGSgrDzgEAqcgRyQA9AwhsAnQiQAzAaA6EApigSRQAmAQAUAPANuzvQALgDAMgGQAAAAABAAQABgBABAAAOMz7IgEACIAhgQQBKgfBJgVQDphBCdBQQixBdicBzQk3DmAQBBANuzvQkBBoicB0QkUDPgZBZAOMz7QgQAGgOAGAOMz7QiyiZj2BhQjTB/jLCRQmSEhApBgAgmkwIAwA3QA7BGA6BQQC4D/BdD+QCBFjhKEuQhcF5mVEOEghdgFLQgbESESD2IAzAuQA2ASA7ANQC7AqChgcQDhgmCMisQCqjPAjmJA9KsuQgLAKgLAKQh1BxhBB9Qg8BzgLBuIs0AAQmMAKmrAbQtWA1iXBXICKCuQCwDSC9CwQJbIyHmAeIgnBJQg1B1gFBZQgIB8BUA0QBsBCEFg3EglnAF7QATABASADIgTA/QgYBNgeBLQhgDxhyB/QgxBJhWBfQisC+i5BrIhJAWEglnAF7QgDATgnAtQhPBainCMQhoBYhoBJQjQCUhWAQEgpqAGZIBRgTQBhgSBRAHEglCAF/QAEK2njGDEglCAF/QBcAPA5AyAXDF+IJwoVAZGGsIIIlAAZ0MbIHOgIAYlLGIHyhvAaOIPIGji+");
	this.shape_8.setTransform(479.0031,215.9992);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f().s("#000000").ss(3,1,1).p("EgshAW4IB0BmQCbB8C9BtQEHCXEdBhQF0B/GaAkQLIA9L0jgQFDhfFMiUQVrpqWv3ZIBQBcQBkBwBoBiQFLE2DtAxQgdjLhPjeQidm+j2hiIBdhvQBviTBaitQD9nrgEocQgBhEgEhFQgigIg8AJQh3ASiDBWQgXAPgXARQmKEillMlQi3AGi4AGQAKAKlQADQjHAJjJAKQj2ANj5APQgFAAgGABQinAKioAMQACAKFNggEApigSRQAmAQAUAPQA9AwhsAnQiQAzAaA6EApigSRQAZAPAWARIALgBIA0gCQBOAABMALQDiAhCBB6QijAGijAHAXC0uIBCgUQBSgVBOgGQD5gSB4CPQAVAaAOAaIBIADQBCgTBCgJQDUgcCKBQEAgVgTgQBFCGjfBFQjeBFARBVQhQAFhQAGQl/AblBAeQmBAkkpAoQhwAPhjAPQiFAVhvAWQmjBThmA9QgPgjgYgrQhIiEhihbQk5kgnBDuQglAZguAqQgDgHgEgHQh3jIihhEQkOhxlMD4QhHAng9BjQh7DFAxEnEAhCAMTQgYCEgtBWI22ikQUzx6CQh8IAbCqQAHA2AHA2QARCFAKB+QABARABARQAdGSgrDzgANuzvQALgDAMgGQAAAAABAAQABgBABAAAOMz7IgEACIAhgQQBKgfBJgVQDphBCdBQQixBdicBzQk3DmAQBBANuzvQkBBoicB0QkUDPgZBZAOMz7QgQAGgOAGAOMz7QiyiZj2BhQjTB/jLCRQmSEhApBgAgmkwIAwA3QA7BGA6BQQC4D/BdD+QCBFjhKEuQhcF5mVEOEghdgFLQgbESESD2IAzAuQA2ASA7ANQC7AqChgcQDhgmCMisQCqjPAjmJA9KsuQgLAKgLAKQh1BxhBB9Qg8BzgLBuIs0AAQmMAKmrAbQtWA1iXBXICKCuQCwDSC9CwQJbIyHmAeIgnBJQg1B1gFBZQgIB8BUA0QBsBCEFg3EglnAF7QATABASADIgTA/QgYBNgeBLQhgDxhyB/QgxBJhWBfQisC+i5BrIhJAWEglnAF7QgDATgnAtQhPBainCMQhoBYhoBJQjQCUhWAQEgpqAGZIBRgTQBhgSBRAHEglCAF/QAEK2njGDEglCAF/QBcAPA5AyAXDF+IJwoVAZGGsIIIlAAZ0MbIHOgIAYlLGIHyhvAaOIPIGji+");
	this.shape_9.setTransform(479.0031,211.7992);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("rgba(153,255,204,0.839)").s().p("EgzVATWQAGhZA1h0IAmhJQBWgRDQiTQBohKBohXQCoiMBOhbQAogtACgTQATACASADIgSA+QgZBOgdBLQhgDwhzB/QgxBKhWBfQisC+i4BqIhKAWQhUgzAIh9gAJRMjIXDz3IAaCqIAPBsQAQCFAKB/IADAiQAcGRgrDzInOAJIHOgJQgYCFgtBVgAYvKgIHyhwgAaXHoIGki+gAZPGGIIIlAgAXMFYIJxoWgABQxKQDLiRDTh+QD1hiCyCZIgeAMQkABoicB1QkUDPgZBYQAZhYEUjPQCch1EAhoQAMgDALgFIACgBIABgBIAigPQBJggBJgUQDqhCCdBRQiyBcibBzQkoDcAABFIABAHQmCAkkoAnQhxAPhiAQQiGAVhuAWQgqhgGTkigANXtkQAAhFEojcQCbhzCyhcIBCgUQBSgVBNgGQD6gSB3CPQARAgAAAcQgBBaipA1QjOA/AABOIABAMIigALQl/AclBAeIgBgHgAa3uuQAAhODOg/QCpg1ABhaQAAgcgRggQAVAaAOAZIBJADQBBgSBDgJQDUgcCKBPQAZAPAVARIALAAIA0gCQBPgBBMALQDhAiCBB6IlGANQjHAIjJALQgEgJAAgJQAAgwB6grQBFgZABgdQAAgQgXgRQAXARAAAQQgBAdhFAZQh6ArAAAwQAAAJAEAJQj2AMj4AQIgLAAIlPAWIgBgMgEAgegUGIAAAAg");
	this.shape_10.setTransform(478.0652,215.6244);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("rgba(153,255,204,0.839)").s().p("EgzVATWQAGhZA1h0IAmhJQBWgRDQiTQBohKBohXQCoiMBOhbQAogtACgTQATACASADIgSA+QgZBOgdBLQhgDwhzB/QgxBKhWBfQisC+i4BqIhKAWQhUgzAIh9gAJRMjIXDz3IAaCqIAPBsQAQCFAKB/IADAiQAcGRgrDzInOAJIHOgJQgYCFgtBVgAYvKgIHyhwgAaXHoIGki+gAZPGGIIIlAgAXMFYIJxoWgABQxKQDLiRDTh+QD1hiCyCZIgeAMQAMgDALgFIACgBIABgBIAigPQBJggBJgUQDqhCCdBRQiyBcibBzQkoDcAABFIABAHQmCAkkoAnQAZhYEUjPQCch1EAhoQkABoicB1QkUDPgZBYQhxAPhiAQQiGAVhuAWQgqhgGTkigANXtkQAAhFEojcQCbhzCyhcIBCgUQBSgVBNgGQD6gSB3CPQARAgAAAcQgBBaipA1QjOA/AABOIABAMIigALQl/AclBAeIgBgHgAa3uuQAAhODOg/QCpg1ABhaQAAgcgRggQAVAaAOAZIBJADQBBgSBDgJQDUgcCKBPQAZAPAVARIALAAIA0gCQBPgBBMALQDhAiCBB6IlGANQjHAIjJALQgEgJAAgJQAAgwB6grQBFgZABgdQAAgQgXgRQAXARAAAQQgBAdhFAZQh6ArAAAwQAAAJAEAJQj2AMj4AQIgLAAIlPAWIgBgMgEAgegUGIAAAAg");
	this.shape_11.setTransform(478.0652,213.5244);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f().s("#000000").ss(3,1,1).p("EgshAW4IB0BmQCbB8C9BtQEHCXEdBhQF0B/GaAkQLIA9L0jgQFDhfFMiUQVrpqWv3ZIBQBcQBkBwBoBiQFLE2DtAxQgdjLhPjeQidm+j2hiIBdhvQBviTBaitQD9nrgEocQgBhEgEhFQgigIg8AJQh3ASiDBWQgXAPgXARQmKEillMlQi3AGi4AGQAKAKlQADQjHAJjJAKQj2ANj5APQgFAAgGABQinAKioAMQACAKFNggEApigSRQAmAQAUAPQA9AwhsAnQiQAzAaA6EApigSRQAZAPAWARIALgBIA0gCQBOAABMALQDiAhCBB6QijAGijAHAXC0uIBCgUQBSgVBOgGQD5gSB4CPQAVAaAOAaIBIADQBCgTBCgJQDUgcCKBQEAgVgTgQBFCGjfBFQjeBFARBVQhQAFhQAGQl/AblBAeQmBAkkpAoQhwAPhjAPQiFAVhvAWQmjBThmA9QgPgjgYgrQhIiEhihbQk5kgnBDuQglAZguAqQgDgHgEgHQh3jIihhEQkOhxlMD4QhHAng9BjQh7DFAxEnEAhCAMTQgYCEgtBWI22ikQUzx6CQh8IAbCqQAHA2AHA2QARCFAKB+QABARABARQAdGSgrDzgANuzvQALgDAMgGQAAAAABAAQABgBABAAAOMz7IgEACIAhgQQBKgfBJgVQDphBCdBQQixBdicBzQk3DmAQBBANuzvQkBBoicB0QkUDPgZBZAOMz7QgQAGgOAGAOMz7QiyiZj2BhQjTB/jLCRQmSEhApBgAgmkwIAwA3QA7BGA6BQQC4D/BdD+QCBFjhKEuQhcF5mVEOEghdgFLQgbESESD2IAzAuQA2ASA7ANQC7AqChgcQDhgmCMisQCqjPAjmJA9KsuQgLAKgLAKQh1BxhBB9Qg8BzgLBuIs0AAQmMAKmrAbQtWA1iXBXICKCuQCwDSC9CwQJbIyHmAeIgnBJQg1B1gFBZQgIB8BUA0QBsBCEFg3EgpqAGZIBRgTQBhgSBRAHQATABASADIgTA/QgYBNgeBLQhgDxhyB/QgxBJhWBfQisC+i5BrIhJAWEglnAF7QgDATgnAtQhPBainCMQhoBYhoBJQjQCUhWAQEglCAF/QAEK2njGDEglCAF/QBcAPA5AyAXDF+IJwoVAZGGsIIIlAAZ0MbIHOgIAYlLGIHyhvAaOIPIGji+");
	this.shape_12.setTransform(479.0031,207.5992);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#FF6699").s().p("EgQjAiiQmagkl0h/QkdhhkHiXQi9htibh8Ih0hmQHfmAAAqrIAAgOQBcAPA5AyQg5gyhcgPIAAAOQAAKrnfGAQkFA3hshCIBJgWQC5hrCsi+QBWhfAxhJQByh/BgjxQAehLAYhNIATg/QgSgDgTgBIgDgBIAAAAQgUgBgWAAIAAAAIgBAAQg4AAhAAKIgEABIgFABIgDABIhRATIBRgTIADgBIAFgBIAEgBQBAgKA4AAIABAAIAAAAQAWAAAUABIAAAAIADABQgDATgnAtQhPBainCMQhoBYhoBJQjQCUhWAQQnmgepboyQi9iwiwjSIiKiuQCXhXNWg1QGrgbGMgKIM0AAQgbESESD2IAzAuQA2ASA7ANQC7AqChgcQDhgmCMisQCqjPAjmJQBmg9GjhTQBvgWCFgVQBjgPBwgPQEpgoGBgkQFBgeF/gbICggLQACAKFNggIALgBQD5gPD2gNQDJgKDHgJQFQgDgKgKIFvgMQFlslGKkiQAXgRAXgPQCDhWB3gSQA8gJAiAIQAEBFABBEQAEIcj9HrQhaCthvCTIhdBvQD2BiCdG+QBPDeAdDLQjtgxlLk2QhohihkhwIhQhcQ2vXZ1rJqQlMCUlDBfQpRCwo2AAQibAAiagNgAHLQrQhcF5mVEOQGVkOBcl5QAbhuAAh1QAAjMhSjiQhdj+i4j/Qg6hQg7hGIgwg3IAwA3QA7BGA6BQQC4D/BdD+QBSDiAADMQAAB1gbBugAJHNJIW2CkQAthWAYiEQArjzgdmSIgCgiQgKh+gRiFIgOhsIgbiqI3DT2g");
	this.shape_13.setTransform(479.0031,207.5992);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#FF6699").s().p("EgQjAiiQmagkl0h/QkdhhkHiXQi9htibh8Ih0hmQHfmAAAqrIAAgOQBcAPA5AyQg5gyhcgPIAAAOQAAKrnfGAQkFA3hshCIBJgWQC5hrCsi+QBWhfAxhJQByh/BgjxQAehLAYhNIATg/QgSgDgTgBIgFgBIgogBIAAAAIgBAAQg2AAg+AKIgHABIAAAAIgGABIgDABIhRATIBRgTIADgBIAGgBIAAAAIAHgBQA+gKA2AAIABAAIAAAAIAoABIAFABQgDATgnAtQhPBainCMQhoBYhoBJQjQCUhWAQQnmgepboyQi9iwiwjSIiKiuQCXhXNWg1QGrgbGMgKIM0AAQgbESESD2IAzAuQA2ASA7ANQC7AqChgcQDhgmCMisQCqjPAjmJQBmg9GjhTQBvgWCFgVQBjgPBwgPQEpgoGBgkQFBgeF/gbICggLQACAKFNggIALgBQD5gPD2gNQDJgKDHgJQFQgDgKgKIFvgMQFlslGKkiQAXgRAXgPQCDhWB3gSQA8gJAiAIQAEBFABBEQAEIcj9HrQhaCthvCTIhdBvQD2BiCdG+QBPDeAdDLQjtgxlLk2QhohihkhwIhQhcQ2vXZ1rJqQlMCUlDBfQpRCwo2AAQibAAiagNgAHLQrQhcF5mVEOQGVkOBcl5QAbhuAAh1QAAjMhSjiQhdj+i4j/Qg6hQg7hGIgwg3IAwA3QA7BGA6BQQC4D/BdD+QBSDiAADMQAAB1gbBugAJHNJIW2CkQAthWAYiEQArjzgdmSIgCgiQgKh+gRiFIgOhsIgbiqI3DT2g");
	this.shape_14.setTransform(479.0031,205.4992);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f().s("#000000").ss(3,1,1).p("EgshAW4IB0BmQCbB8C9BtQEHCXEdBhQF0B/GaAkQLIA9L0jgQFDhfFMiUQVrpqWv3ZIBQBcQBkBwBoBiQFLE2DtAxQgdjLhPjeQidm+j2hiIBdhvQBviTBaitQD9nrgEocQgBhEgEhFQgigIg8AJQh3ASiDBWQgXAPgXARQmKEillMlQi3AGi4AGQijAGijAHQjHAJjJAKQj2ANj5APQgFAAgGABQinAKioAMQACAKFNggEAqcgRyIA0gCQBOAABMALQDiAhCBB6QAKAKlQADEApigSRQAZAPAWARIALgBQA9AwhsAnQiQAzAaA6EApigSRQAmAQAUAPAXC0uIBCgUQBSgVBOgGQD5gSB4CPQAVAaAOAaIBIADQBCgTBCgJQDUgcCKBQEAgVgTgQBFCGjfBFQjeBFARBVQhQAFhQAGQl/AblBAeQmBAkkpAoQhwAPhjAPQiFAVhvAWQmjBThmA9QgPgjgYgrQhIiEhihbQk5kgnBDuQglAZguAqQgDgHgEgHQh3jIihhEQkOhxlMD4QhHAng9BjQh7DFAxEnEAhCAMTQgYCEgtBWI22ikQUzx6CQh8IAbCqQAHA2AHA2QARCFAKB+QABARABARQAdGSgrDzgAOIz5IAhgQQBKgfBJgVQDphBCdBQQixBdicBzQk3DmAQBBAOMz7IgEACANuzvQALgDAMgGQAAAAABAAQABgBABAAANuzvQkBBoicB0QkUDPgZBZAOMz7QiyiZj2BhQjTB/jLCRQmSEhApBgAOMz7QgQAGgOAGAgmkwIAwA3QA7BGA6BQQC4D/BdD+QCBFjhKEuQhcF5mVEOEghdgFLQgbESESD2IAzAuQA2ASA7ANQC7AqChgcQDhgmCMisQCqjPAjmJA9KsuQgLAKgLAKQh1BxhBB9Qg8BzgLBuIs0AAQmMAKmrAbQtWA1iXBXICKCuQCwDSC9CwQJbIyHmAeIgnBJQg1B1gFBZQgIB8BUA0QBsBCEFg3EglnAF7QATABASADIgTA/QgYBNgeBLQhgDxhyB/QgxBJhWBfQisC+i5BrIhJAWEgpqAGZIBRgTQBhgSBRAHQgDATgnAtQhPBainCMQhoBYhoBJQjQCUhWAQEglCAF/QBcAPA5AyEglCAF/QAEK2njGDAaOIPIGji+AYlLGIHyhvAZ0MbIHOgIAZGGsIIIlAAXDF+IJwoV");
	this.shape_15.setTransform(479.0031,207.5992);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("rgba(153,255,204,0.839)").s().p("EgzVATWQAGhZA1h0IAmhJQBWgRDQiTQBohKBohXQCoiMBOhbQAogtACgTQATACASADIgSA+QgZBOgdBLQhgDwhzB/QgxBKhWBfQisC+i4BqIhKAWQhUgzAIh9gAJRMjIXDz3IAaCqIAPBsIpxIWIJxoWQAQCFAKB/IoIFAIIIlAIADAiQAcGRgrDzInOAJIHOgJQgYCFgtBVgAYvKgIHyhwgAaXHoIGki+gABQxKQDLiRDTh+QD1hiCyCZIgeAMQAMgDALgFIACgBIABgBIAigPQBJggBJgUQDqhCCdBRIBCgUQBSgVBNgGQD6gSB3CPQARAgAAAcQgBBaipA1QjOA/AABOIABAMIigALQl/AclBAeIgBgHQAAhFEojcQCbhzCyhcQiyBcibBzQkoDcAABFIABAHQmCAkkoAnQAZhYEUjPQCch1EAhoQkABoicB1QkUDPgZBYQhxAPhiAQQiGAVhuAWQgqhgGTkigAa3uuQAAhODOg/QCpg1ABhaQAAgcgRggQAVAaAOAZIBJADQBBgSBDgJQDUgcCKBPQAZAPAVARIALAAQAXARAAAQQgBAdhFAZQh6ArAAAwQAAAJAEAJQgEgJAAgJQAAgwB6grQBFgZABgdQAAgQgXgRIA0gCQBPgBBMALQDhAiCBB6IlGANQjHAIjJALQj2AMj4AQIgLAAIlPAWIgBgMgEAgegUGIAAAAg");
	this.shape_16.setTransform(478.0652,211.4244);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#FF6699").s().p("EgQjAiiQmagkl0h/QkdhhkHiXQi9htibh8Ih0hmQHfmAAAqrIAAgOQBcAPA5AyQg5gyhcgPQgSgDgTgBIgDgBIAAAAQgUgBgWAAIAAAAIgBAAQg4AAhAAKIgEABIgFABIgDABIhRATIBRgTIADgBIAFgBIAEgBQBAgKA4AAIABAAIAAAAQAWAAAUABIAAAAIADABQgDATgnAtQhPBainCMQhoBYhoBJQjQCUhWAQQnmgepboyQi9iwiwjSIiKiuQCXhXNWg1QGrgbGMgKIM0AAQgbESESD2IAzAuQA2ASA7ANQC7AqChgcQDhgmCMisQCqjPAjmJQBmg9GjhTQBvgWCFgVQBjgPBwgPQEpgoGBgkQFBgeF/gbICggLQACAKFNggIALgBQD5gPD2gNQDJgKDHgJQFQgDgKgKIFvgMQFlslGKkiQAXgRAXgPQCDhWB3gSQA8gJAiAIQAEBFABBEQAEIcj9HrQhaCthvCTIhdBvQD2BiCdG+QBPDeAdDLQjtgxlLk2QhohihkhwIhQhcQ2vXZ1rJqQlMCUlDBfQpRCwo2AAQibAAiagNgAHLQrQhcF5mVEOQGVkOBcl5QAbhuAAh1QAAjMhSjiQhdj+i4j/Qg6hQg7hGIgwg3IAwA3QA7BGA6BQQC4D/BdD+QBSDiAADMQAAB1gbBugAJHNJIW2CkQAthWAYiEQArjzgdmSIgCgiQgKh+gRiFIgOhsIgbiqI3DT2gEgySAWtIBJgWQC5hrCsi+QBWhfAxhJQByh/BgjxQAehLAYhNIATg/IAAAOQAAKrnfGAQh3AZhXAAQhoAAg7gkg");
	this.shape_17.setTransform(479.0031,207.5992);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f().s("#000000").ss(3,1,1).p("EgshAW4IB0BmQCbB8C9BtQEHCXEdBhQF0B/GaAkQLIA9L0jgQFDhfFMiUQVrpqWv3ZIBQBcQBkBwBoBiQFLE2DtAxQgdjLhPjeQidm+j2hiIBdhvQBviTBaitQD9nrgEocQgBhEgEhFQgigIg8AJQh3ASiDBWQgXAPgXARQmKEillMlQi3AGi4AGQijAGijAHQjHAJjJAKQj2ANj5APQgFAAgGABQinAKioAMQACAKFNggEAqcgRyIA0gCQBOAABMALQDiAhCBB6QAKAKlQADEApigSRQAZAPAWARIALgBQA9AwhsAnQiQAzAaA6EApigSRQAmAQAUAPAXC0uIBCgUQBSgVBOgGQD5gSB4CPQAVAaAOAaIBIADQBCgTBCgJQDUgcCKBQEAgVgTgQBFCGjfBFQjeBFARBVQhQAFhQAGQl/AblBAeQmBAkkpAoQhwAPhjAPQiFAVhvAWQmjBThmA9QgPgjgYgrQhIiEhihbQk5kgnBDuQglAZguAqQgDgHgEgHQh3jIihhEQkOhxlMD4QhHAng9BjQh7DFAxEnEAhCAMTQgYCEgtBWI22ikQUzx6CQh8IAbCqQAHA2AHA2QARCFAKB+QABARABARQAdGSgrDzgAOIz5IAhgQQBKgfBJgVQDphBCdBQQixBdicBzQk3DmAQBBAOMz7IgEACANuzvQALgDAMgGQAAAAABAAQABgBABAAANuzvQkBBoicB0QkUDPgZBZAOMz7QiyiZj2BhQjTB/jLCRQmSEhApBgAOMz7QgQAGgOAGAgmkwIAwA3QA7BGA6BQQC4D/BdD+QCBFjhKEuQhcF5mVEOEghdgFLQgbESESD2IAzAuQA2ASA7ANQC7AqChgcQDhgmCMisQCqjPAjmJA9KsuQgLAKgLAKQh1BxhBB9Qg8BzgLBuIs0AAQmMAKmrAbQtWA1iXBXICKCuQCwDSC9CwQJbIyHmAeIgnBJQg1B1gFBZQgIB8BUA0QBsBCEFg3EgpqAGZIBRgTQBhgSBRAHQgDATgnAtQhPBainCMQhoBYhoBJQjQCUhWAQEglCAF/IgTA/QgYBNgeBLQhgDxhyB/QgxBJhWBfQisC+i5BrIhJAWEglnAF7QATABASADQBcAPA5AyEglCAF/QAEK2njGDAaOIPIGji+AYlLGIHyhvAZ0MbIHOgIAZGGsIIIlAAXDF+IJwoV");
	this.shape_18.setTransform(479.0031,209.6992);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f("#FF6699").s().p("EgQjAiiQmagkl0h/QkdhhkHiXQi9htibh8Ih0hmQHfmAAAqrIAAgOQBcAPA5AyQg5gyhcgPQgSgDgTgBIgDgBIAAAAQgUgBgWAAIAAAAIgBAAQg8AAhFAMIgDABIhRATIBRgTIADgBQBFgMA8AAIABAAIAAAAQAWAAAUABIAAAAIADABQgDATgnAtQhPBainCMQhoBYhoBJQjQCUhWAQQnmgepboyQi9iwiwjSIiKiuQCXhXNWg1QGrgbGMgKIM0AAQgbESESD2IAzAuQA2ASA7ANQC7AqChgcQDhgmCMisQCqjPAjmJQBmg9GjhTQBvgWCFgVQBjgPBwgPQEpgoGBgkQFBgeF/gbICggLQACAKFNggIALgBQD5gPD2gNQDJgKDHgJQFQgDgKgKIFvgMQFlslGKkiQAXgRAXgPQCDhWB3gSQA8gJAiAIQAEBFABBEQAEIcj9HrQhaCthvCTIhdBvQD2BiCdG+QBPDeAdDLQjtgxlLk2QhohihkhwIhQhcQ2vXZ1rJqQlMCUlDBfQpRCwo2AAQibAAiagNgAHLQrQhcF5mVEOQGVkOBcl5QAbhuAAh1QAAjMhSjiQhdj+i4j/Qg6hQg7hGIgwg3IAwA3QA7BGA6BQQC4D/BdD+QBSDiAADMQAAB1gbBugAJHNJIW2CkQAthWAYiEQArjzgdmSIgCgiQgKh+gRiFIgOhsIgbiqI3DT2gEgySAWtIBJgWQC5hrCsi+QBWhfAxhJQByh/BgjxQAehLAYhNIATg/IAAAOQAAKrnfGAQh3AZhXAAQhoAAg7gkg");
	this.shape_19.setTransform(479.0031,209.6992);

	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f("rgba(153,255,204,0.839)").s().p("EgzVATWQAGhZA1h0IAmhJQBWgRDQiTQBohKBohXQCoiMBOhbQAogtACgTQATACASADIgSA+QgZBOgdBLQhgDwhzB/QgxBKhWBfQisC+i4BqIhKAWQhUgzAIh9gAJRMjIXDz3IAaCqIAPBsIpxIWIJxoWQAQCFAKB/IoIFAIIIlAIADAiQAcGRgrDzInOAJIHOgJQgYCFgtBVgAYvKgIHyhwgAaXHoIGki+gABQxKQDLiRDTh+QD1hiCyCZIgeAMQkABoicB1QkUDPgZBYQhxAPhiAQQiGAVhuAWQgqhgGTkigAHbw5QCch1EAhoQAMgDALgFIACgBIABgBIAigPQBJggBJgUQDqhCCdBRQiyBcibBzQkoDcAABFIABAHQmCAkkoAnQAZhYEUjPgANXtkQAAhFEojcQCbhzCyhcIBCgUQBSgVBNgGQD6gSB3CPQARAgAAAcQgBBaipA1QjOA/AABOIABAMIigALQl/AclBAeIgBgHgAa3uuQAAhODOg/QCpg1ABhaQAAgcgRggQAVAaAOAZIBJADQBBgSBDgJQDUgcCKBPQAZAPAVARIALAAQAXARAAAQQgBAdhFAZQh6ArAAAwQAAAJAEAJQgEgJAAgJQAAgwB6grQBFgZABgdQAAgQgXgRIA0gCQBPgBBMALQDhAiCBB6IlGANQjHAIjJALQj2AMj4AQIgLAAIlPAWIgBgMgAXM1UIAAAAg");
	this.shape_20.setTransform(478.0652,215.6244);

	this.shape_21 = new cjs.Shape();
	this.shape_21.graphics.f("#FF6699").s().p("EgQjAiiQmagkl0h/QkdhhkHiXQi9htibh8Ih0hmQHfmAAAqrIAAgOQBcAPA5AyQg5gyhcgPQgSgDgTgBIgFgBIgogBIAAAAIgBAAQg2AAg+AKIgHABIAAAAIgGABIgDABIhRATIBRgTIADgBIAGgBIAAAAIAHgBQA+gKA2AAIABAAIAAAAIAoABIAFABQgDATgnAtQhPBainCMQhoBYhoBJQjQCUhWAQQnmgepboyQi9iwiwjSIiKiuQCXhXNWg1QGrgbGMgKIM0AAQgbESESD2IAzAuQA2ASA7ANQC7AqChgcQDhgmCMisQCqjPAjmJQBmg9GjhTQBvgWCFgVQBjgPBwgPQEpgoGBgkQFBgeF/gbICggLQACAKFNggIALgBQD5gPD2gNQDJgKDHgJQFQgDgKgKIFvgMQFlslGKkiQAXgRAXgPQCDhWB3gSQA8gJAiAIQAEBFABBEQAEIcj9HrQhaCthvCTIhdBvQD2BiCdG+QBPDeAdDLQjtgxlLk2QhohihkhwIhQhcQ2vXZ1rJqQlMCUlDBfQpRCwo2AAQibAAiagNgAHLQrQhcF5mVEOQGVkOBcl5QAbhuAAh1QAAjMhSjiQhdj+i4j/Qg6hQg7hGIgwg3IAwA3QA7BGA6BQQC4D/BdD+QBSDiAADMQAAB1gbBugAJHNJIW2CkQAthWAYiEQArjzgdmSIgCgiQgKh+gRiFIgOhsIgbiqI3DT2gEgySAWtIBJgWQC5hrCsi+QBWhfAxhJQByh/BgjxQAehLAYhNIATg/IAAAOQAAKrnfGAQh3AZhXAAQhoAAg7gkg");
	this.shape_21.setTransform(479.0031,211.7992);

	this.shape_22 = new cjs.Shape();
	this.shape_22.graphics.f().s("#000000").ss(3,1,1).p("EgshAW4IB0BmQCbB8C9BtQEHCXEdBhQF0B/GaAkQLIA9L0jgQFDhfFMiUQVrpqWv3ZIBQBcQBkBwBoBiQFLE2DtAxQgdjLhPjeQidm+j2hiIBdhvQBviTBaitQD9nrgEocQgBhEgEhFQgigIg8AJQh3ASiDBWQgXAPgXARQmKEillMlQi3AGi4AGQAKAKlQADQjHAJjJAKQj2ANj5APQgFAAgGABQinAKioAMQACAKFNggAXC0uIBCgUQBSgVBOgGQD5gSB4CPQAVAaAOAaIBIADQBCgTBCgJQDUgcCKBQQAZAPAWARIALgBQA9AwhsAnQiQAzAaA6EAgVgTgQBFCGjfBFQjeBFARBVQhQAFhQAGQl/AblBAeQmBAkkpAoQhwAPhjAPQiFAVhvAWQmjBThmA9QgPgjgYgrQhIiEhihbQk5kgnBDuQglAZguAqQgDgHgEgHQh3jIihhEQkOhxlMD4QhHAng9BjQh7DFAxEnEAhCAMTQgYCEgtBWI22ikQUzx6CQh8IAbCqQAHA2AHA2QARCFAKB+QABARABARQAdGSgrDzgEAqcgRyIA0gCQBOAABMALQDiAhCBB6QijAGijAHEApigSRQAmAQAUAPAOIz5IAhgQQBKgfBJgVQDphBCdBQQixBdicBzQk3DmAQBBAOMz7IgEACANuzvQALgDAMgGQAAAAABAAQABgBABAAANuzvQkBBoicB0QkUDPgZBZAOMz7QiyiZj2BhQjTB/jLCRQmSEhApBgAOMz7QgQAGgOAGAgmkwIAwA3QA7BGA6BQQC4D/BdD+QCBFjhKEuQhcF5mVEOEghdgFLQgbESESD2IAzAuQA2ASA7ANQC7AqChgcQDhgmCMisQCqjPAjmJA9KsuQgLAKgLAKQh1BxhBB9Qg8BzgLBuIs0AAQmMAKmrAbQtWA1iXBXICKCuQCwDSC9CwQJbIyHmAeIgnBJQg1B1gFBZQgIB8BUA0QBsBCEFg3EgpqAGZIBRgTQBhgSBRAHQgDATgnAtQhPBainCMQhoBYhoBJQjQCUhWAQEglCAF/IgTA/QgYBNgeBLQhgDxhyB/QgxBJhWBfQisC+i5BrIhJAWEglnAF7QATABASADQBcAPA5AyEglCAF/QAEK2njGDAaOIPIGji+AYlLGIHyhvAZ0MbIHOgIAZGGsIIIlAAXDF+IJwoV");
	this.shape_22.setTransform(479.0031,213.8992);

	this.shape_23 = new cjs.Shape();
	this.shape_23.graphics.f("rgba(153,255,204,0.839)").s().p("EgzVATWQAGhZA1h0IAmhJQBWgRDQiTQBohKBohXQCoiMBOhbQAogtACgTQATACASADIgSA+QgZBOgdBLQhgDwhzB/QgxBKhWBfQisC+i4BqIhKAWQhUgzAIh9gAJRMjIXDz3IAaCqIAPBsIpxIWIJxoWQAQCFAKB/IoIFAIIIlAIADAiQAcGRgrDzQgYCFgtBVgAZ9L1IHOgJgAYvKgIHyhwgAaXHoIGki+gEAhXABGIAAAAgABQxKQDLiRDTh+QD1hiCyCZIgeAMQkABoicB1QkUDPgZBYQAZhYEUjPQCch1EAhoQAMgDALgFIACgBIABgBIAigPQBJggBJgUQDqhCCdBRIBCgUQBSgVBNgGQD6gSB3CPQAVAaAOAZIBJADQBBgSBDgJQDUgcCKBPQAZAPAVARIALAAIA0gCQBPgBBMALQDhAiCBB6IlGANQjHAIjJALQgEgJAAgJQAAgwB6grQBFgZABgdQAAgQgXgRQAXARAAAQQgBAdhFAZQh6ArAAAwQAAAJAEAJQj2AMj4AQIgLAAIlPAWIgBgMQAAhODOg/QCpg1ABhaQAAgcgRggQARAgAAAcQgBBaipA1QjOA/AABOIABAMIigALQl/AclBAeIgBgHQAAhFEojcQCbhzCyhcQiyBcibBzQkoDcAABFIABAHQmCAkkoAnQhxAPhiAQQiGAVhuAWQgqhgGTkigEAoAgPUIAAAAg");
	this.shape_23.setTransform(478.0652,217.7244);

	this.shape_24 = new cjs.Shape();
	this.shape_24.graphics.f("#FF6699").s().p("EgQjAiiQmagkl0h/QkdhhkHiXQi9htibh8Ih0hmQHfmAAAqrIAAgOQBcAPA5AyQg5gyhcgPIAAAOQAAKrnfGAQkFA3hshCIBJgWQC5hrCsi+QBWhfAxhJQByh/BgjxQAehLAYhNIATg/QgSgDgTgBIgDgBIAAAAQgUgBgWAAIAAAAIgBAAQg4AAhAAKIgEABIgFABIgDABIhRATIBRgTIADgBIAFgBIAEgBQBAgKA4AAIABAAIAAAAQAWAAAUABIAAAAIADABQgDATgnAtQhPBainCMQhoBYhoBJQjQCUhWAQQnmgepboyQi9iwiwjSIiKiuQCXhXNWg1QGrgbGMgKIM0AAQgbESESD2IAzAuQA2ASA7ANQC7AqChgcQDhgmCMisQCqjPAjmJQBmg9GjhTQBvgWCFgVQBjgPBwgPQEpgoGBgkQFBgeF/gbICggLQACAKFNggIALgBQD5gPD2gNQDJgKDHgJQFQgDgKgKIFvgMQFlslGKkiQAXgRAXgPQCDhWB3gSQA8gJAiAIQAEBFABBEQAEIcj9HrQhaCthvCTIhdBvQD2BiCdG+QBPDeAdDLQjtgxlLk2QhohihkhwIhQhcQ2vXZ1rJqQlMCUlDBfQpRCwo2AAQibAAiagNgAHLQrQhcF5mVEOQGVkOBcl5QAbhuAAh1QAAjMhSjiQhdj+i4j/Qg6hQg7hGIgwg3IAwA3QA7BGA6BQQC4D/BdD+QBSDiAADMQAAB1gbBugAJHNJIW2CkQAthWAYiEQArjzgdmSIgCgiQgKh+gRiFIgOhsIgbiqI3DT2gEglCAF/IAAAAg");
	this.shape_24.setTransform(479.0031,213.8992);

	this.shape_25 = new cjs.Shape();
	this.shape_25.graphics.f().s("#000000").ss(3,1,1).p("EgshAW4IB0BmQCbB8C9BtQEHCXEdBhQF0B/GaAkQLIA9L0jgQFDhfFMiUQVrpqWv3ZIBQBcQBkBwBoBiQFLE2DtAxQgdjLhPjeQidm+j2hiIBdhvQBviTBaitQD9nrgEocQgBhEgEhFQgigIg8AJQh3ASiDBWQgXAPgXARQmKEillMlQi3AGi4AGQAKAKlQADQjHAJjJAKQj2ANj5APQgFAAgGABQinAKioAMQACAKFNggAXC0uIBCgUQBSgVBOgGQD5gSB4CPQAVAaAOAaIBIADQBCgTBCgJQDUgcCKBQQAZAPAWARIALgBIA0gCQBOAABMALQDiAhCBB6QijAGijAHEAgVgTgQBFCGjfBFQjeBFARBVQhQAFhQAGQl/AblBAeQmBAkkpAoQhwAPhjAPQiFAVhvAWQmjBThmA9QgPgjgYgrQhIiEhihbQk5kgnBDuQglAZguAqQgDgHgEgHQh3jIihhEQkOhxlMD4QhHAng9BjQh7DFAxEnEAhCAMTQgYCEgtBWI22ikQUzx6CQh8IAbCqQAHA2AHA2QARCFAKB+QABARABARQAdGSgrDzgEApigSRQAmAQAUAPQA9AwhsAnQiQAzAaA6AOIz5IAhgQQBKgfBJgVQDphBCdBQQixBdicBzQk3DmAQBBAOMz7IgEACANuzvQALgDAMgGQAAAAABAAQABgBABAAANuzvQkBBoicB0QkUDPgZBZAOMz7QiyiZj2BhQjTB/jLCRQmSEhApBgAOMz7QgQAGgOAGAgmkwIAwA3QA7BGA6BQQC4D/BdD+QCBFjhKEuQhcF5mVEOEghdgFLQgbESESD2IAzAuQA2ASA7ANQC7AqChgcQDhgmCMisQCqjPAjmJA9KsuQgLAKgLAKQh1BxhBB9Qg8BzgLBuIs0AAQmMAKmrAbQtWA1iXBXICKCuQCwDSC9CwQJbIyHmAeIgnBJQg1B1gFBZQgIB8BUA0QBsBCEFg3EgpqAGZIBRgTQBhgSBRAHQgDATgnAtQhPBainCMQhoBYhoBJQjQCUhWAQEglCAF/IgTA/QgYBNgeBLQhgDxhyB/QgxBJhWBfQisC+i5BrIhJAWEglnAF7QATABASADQBcAPA5AyEglCAF/QAEK2njGDAaOIPIGji+AYlLGIHyhvAZ0MbIHOgIAZGGsIIIlAAXDF+IJwoV");
	this.shape_25.setTransform(479.0031,218.0992);

	this.shape_26 = new cjs.Shape();
	this.shape_26.graphics.f("rgba(153,255,204,0.839)").s().p("EgzVATWQAGhZA1h0IAmhJQBWgRDQiTQBohKBohXQCoiMBOhbQAogtACgTQATACASADIgSA+QgZBOgdBLQhgDwhzB/QgxBKhWBfQisC+i4BqIhKAWQhUgzAIh9gAJRMjIXDz3IAaCqIAPBsIpxIWIJxoWQAQCFAKB/IADAiQAcGRgrDzInOAJIHOgJQgYCFgtBVgAYvKgIHyhwgAaXHoIGki+gAZPGGIIIlAgEAhLALsIAAAAgABQxKQDLiRDTh+QD1hiCyCZIgeAMQkABoicB1QkUDPgZBYQhxAPhiAQQiGAVhuAWQgqhgGTkigAHbw5QCch1EAhoQAMgDALgFIACgBIABgBIAigPQBJggBJgUQDqhCCdBRQiyBcibBzQkoDcAABFIABAHQmCAkkoAnQAZhYEUjPgANXtkQAAhFEojcQCbhzCyhcIBCgUQBSgVBNgGQD6gSB3CPQARAgAAAcQgBBaipA1QjOA/AABOIABAMIigALQl/AclBAeIgBgHgAa3uuQAAhODOg/QCpg1ABhaQAAgcgRggQAVAaAOAZIBJADQBBgSBDgJQDUgcCKBPQAZAPAVARIALAAQAXARAAAQQgBAdhFAZQh6ArAAAwQAAAJAEAJQj2AMj4AQIgLAAIlPAWIgBgMgEAoAgPUQgEgJAAgJQAAgwB6grQBFgZABgdQAAgQgXgRIA0gCQBPgBBMALQDhAiCBB6IlGANQjHAIjJALIAAAAgEAqlgSYIAAAAgAXM1UIAAAAg");
	this.shape_26.setTransform(478.0652,221.9244);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_5,p:{y:222.2992}},{t:this.shape_4,p:{y:226.1244}},{t:this.shape_3,p:{y:180.2162}},{t:this.shape_2,p:{y:171.025}},{t:this.shape_1,p:{y:222.2992}},{t:this.shape,p:{y:171.025}}]}).to({state:[{t:this.shape_6,p:{y:220.1992}},{t:this.shape_4,p:{y:224.0244}},{t:this.shape_3,p:{y:178.1162}},{t:this.shape_2,p:{y:168.925}},{t:this.shape_1,p:{y:220.1992}},{t:this.shape,p:{y:168.925}}]},4).to({state:[{t:this.shape_7,p:{y:218.0992}},{t:this.shape_4,p:{y:221.9244}},{t:this.shape_3,p:{y:176.0162}},{t:this.shape_2,p:{y:166.825}},{t:this.shape_1,p:{y:218.0992}},{t:this.shape,p:{y:166.825}}]},4).to({state:[{t:this.shape_5,p:{y:215.9992}},{t:this.shape_4,p:{y:219.8244}},{t:this.shape_3,p:{y:173.9162}},{t:this.shape_2,p:{y:164.725}},{t:this.shape_8,p:{y:215.9992}},{t:this.shape,p:{y:164.725}}]},4).to({state:[{t:this.shape_6,p:{y:213.8992}},{t:this.shape_4,p:{y:217.7244}},{t:this.shape_3,p:{y:171.8162}},{t:this.shape_2,p:{y:162.625}},{t:this.shape_8,p:{y:213.8992}},{t:this.shape,p:{y:162.625}}]},4).to({state:[{t:this.shape_7,p:{y:211.7992}},{t:this.shape_10},{t:this.shape_3,p:{y:169.7162}},{t:this.shape_2,p:{y:160.525}},{t:this.shape_9,p:{y:211.7992}},{t:this.shape,p:{y:160.525}}]},4).to({state:[{t:this.shape_5,p:{y:209.6992}},{t:this.shape_11,p:{y:213.5244}},{t:this.shape_3,p:{y:167.6162}},{t:this.shape_2,p:{y:158.425}},{t:this.shape_9,p:{y:209.6992}},{t:this.shape,p:{y:158.425}}]},4).to({state:[{t:this.shape_13},{t:this.shape_11,p:{y:211.4244}},{t:this.shape_3,p:{y:165.5162}},{t:this.shape_2,p:{y:156.325}},{t:this.shape_12,p:{y:207.5992}},{t:this.shape,p:{y:156.325}}]},4).to({state:[{t:this.shape_14},{t:this.shape_11,p:{y:209.3244}},{t:this.shape_3,p:{y:163.4162}},{t:this.shape_2,p:{y:154.225}},{t:this.shape_12,p:{y:205.4992}},{t:this.shape,p:{y:154.225}}]},5).to({state:[{t:this.shape_17,p:{y:207.5992}},{t:this.shape_16,p:{y:211.4244}},{t:this.shape_3,p:{y:165.5162}},{t:this.shape_2,p:{y:156.325}},{t:this.shape_15},{t:this.shape,p:{y:156.325}}]},5).to({state:[{t:this.shape_19},{t:this.shape_16,p:{y:213.5244}},{t:this.shape_3,p:{y:167.6162}},{t:this.shape_2,p:{y:158.425}},{t:this.shape_18,p:{y:209.6992}},{t:this.shape,p:{y:158.425}}]},5).to({state:[{t:this.shape_21,p:{y:211.7992}},{t:this.shape_20},{t:this.shape_3,p:{y:169.7162}},{t:this.shape_2,p:{y:160.525}},{t:this.shape_18,p:{y:211.7992}},{t:this.shape,p:{y:160.525}}]},4).to({state:[{t:this.shape_24},{t:this.shape_23},{t:this.shape_3,p:{y:171.8162}},{t:this.shape_2,p:{y:162.625}},{t:this.shape_22},{t:this.shape,p:{y:162.625}}]},4).to({state:[{t:this.shape_21,p:{y:218.0992}},{t:this.shape_26,p:{y:221.9244}},{t:this.shape_3,p:{y:176.0162}},{t:this.shape_2,p:{y:166.825}},{t:this.shape_25,p:{y:218.0992}},{t:this.shape,p:{y:166.825}}]},4).to({state:[{t:this.shape_17,p:{y:220.1992}},{t:this.shape_26,p:{y:224.0244}},{t:this.shape_3,p:{y:178.1162}},{t:this.shape_2,p:{y:168.925}},{t:this.shape_25,p:{y:220.1992}},{t:this.shape,p:{y:168.925}}]},4).wait(4));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1.5,-18.3,961,464.40000000000003);


(lib.trears = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(255,255,255,0.8)").s().p("Akmh6QB4i9BhgwQBggwCKAAQCJAABhBhQBhBhAACJQAACJg4BOQg5BOifBeQifBdogAEQBJlWB4i8g");
	this.shape.setTransform(48.825,40.825);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,97.7,81.7);


(lib.cry = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("EAhXga0QAoACAmAFIBzAtQCAA8BDBHQDVDin6DZQhxAwiaAEQgGAAgFAAQihAEhpgMQhqgNgygcIAFA/QAFBRAABdQgBErg1EyQioPVptK4QhBBlhJBrQiRDVgmAfQgTAQAZACQASACBLADQC6ARCSBvIBQA7QBdBJA+BHQDGDii2BxQg9BDhvArQjdBVj5h9Qj5h9hRhGQgagXgFgOIgBgJQh/CWiuB1QldDqjoiqQjoipCKj0QBFh5BzhYIEZirQhCg8hjhpQjHjRiojeQoZrGgZo7QgokqgJnNQgJnNgKAIQiEAdiCAOQhjAKhjABQgsAAgpgCA4C54QA2A0AOBCQAHhOAeh1QA9jqB1jDQClkRD/ieQE+jFHwgLQBFgHBNAAQD1ABDcBNQD2BVC6CsQAiAgAhAjQANAOAMAOQAIAJAHAJQARATAQAUQAXAdAVAfQAOAUAOAVQCvEMBRGAIAeB4IAVgdQAbgjAlghIAhA6QAmBIAYBDQBNDWhbBYAH628IJ5AAQADg6gNhZQgaixhRiXQkDnlrFgsQg/ADhkATQjGAlisBSQooEFhYJaIKiAAQAAg6AHhMQAQiYAqhYQA7h7BoAXQBbATB7CFQABABACACQAxA3A4BJIhpiAQAEgRALgZQAXgyAdgiQBdhwB9BLIAnAcQAvAjAlAnQB3B+gVD+gAct6OIAmBRQAsBkAeBaQBfEehRBTEAhXga0IA0A5QA8BIAlBNQB4D3iuCtAZF4JQBkhaCEgrQCHgtCjAHAm928IO3AAA7a7pIgkBHQgrBYgdBVQhdETBKCUA/u8ZIgpBRQgvBlggBfQhmExBYCOQmigUABlIQgLhBAZg8QBQi+Geg/IArACQCXALB9AlQCOAqBKBHQgOAUgSAiQglBEgYBCQhLDSBXBx");
	this.shape.setTransform(258.5996,280.863);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FF0000").s().p("AncEAQgBg6AIhMQAPiXAqhYQA7h7BoAXQBcATB6CFIADADIBpB/Qg3hIgyg3QAGgRALgZQAVgyAdgiQBdhwB+BLIAnAcQAuAjAlAnQB3B9gUD+g");
	this.shape_1.setTransform(261.7491,108.3799);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FFCCFF").s().p("EgNeAqxQjoipCJj0QBFh5B0hYIEZirQhCg8hkhpQjHjRinjeQoZrGgZo7QgokqgJnNQgJnNgLAIQhWhxBLjSQAXhCAlhEQATgiANgUQA2A0AOBCQAHhOAfh1QA8jqB2jDQCkkRD/ieQE/jFHwgLQBFgHBMAAQD1ABDdBNQD1BVC6CsQAjAgAgAjIAaAcIAPASIAgAnQAXAdAWAfIAbApQCvEMBSGAIAeB4IAUgdQAcgjAkghIAhA6QAmBIAZBDQBNDWhcBYQhpgNgygcIAFA/QAFBRgBBdQgBErg0EyQipPVptK4QhBBlhJBrQiRDVgmAfQgTAQAaACIBcAFQC6ARCTBvIBQA7QBcBJA+BHQDHDii2BxQg9BDhvArQjeBVj5h9Qj5h9hRhGQgZgXgGgOIAAgJQh/CWiuB1QjKCIijAAQh3AAhhhIgEgCPgmSQjGAlitBSQooEFhYJaIKjAAIO3AAIJ4AAQADg6gNhZQgaixhRiXQkCnlrFgsQhAADhjATg");
	this.shape_2.setTransform(262.0179,280.863);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FF99FF").s().p("AaWLEQBbhYhNjWQgYhDgmhIIghg6QBkhZCEgsQCHgtCjAIQAoABAmAFIBzAuQCAA7BDBHQDVDin6DaQBnhoAAiAQAAhZgxhkQglhNg8hIIg0g4IA0A4QA8BIAlBNQAxBkAABZQAACAhnBoQhxAwiaAEQAlgnAAhRQAAhggziaQgehagshjIgmhSIAmBSQAsBjAeBaQAzCaAABgQAABRglAnIgLAAIhLAAQhwAAhPgJgAerLNIAAAAgEgh0AKWQgphCAAhmQAAh0A3ikQAghfAvhkIAphQQCXAKB9AlIgkBGQgrBYgdBWQg0CYAABxQAABbAhBCQhjAKhjABIgSAAQgjAAgggBgEgoVAE5QgLhBAZg7QBQi+Geg/IArADIgpBQQgvBkggBfQg3CkAAB0QAABmApBCQmigUABlJgA96HvQAAhxA0iYQAdhWArhYIAkhGQCOApBKBHQgOAVgSAiQglBDgYBCQhLDSBXBxQiEAeiCANQghhCAAhbgAH6EfQAVj/h3h8QglgngvgkIgngbQh9hMhdBwQgdAjgXAxQgLAZgEASIgDgEQh7iEhbgUQhogWg7B7QgqBWgQCYQgHBMAAA7IqiAAQBYpZIokGQCshRDGgmQBkgTA/gCQLFAsEDHkQBRCXAaCxQANBYgDA7g");
	this.shape_3.setTransform(258.5996,105.3485);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.cry, new cjs.Rectangle(-1.5,-1.5,520.2,564.8), null);


(lib.charly_mouth_talk = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("AwfoeQF+DuCsA7QLyEDMjlfQgvCRhYCsQixFWjOCDQgtg8hRg0Qiihni4AsQhAgzhlgfQjNhAihCYQh3hwh9i3Qh+i4jclfQA0AqA/ApABCEaQg1ANgyAYAIaHFQiRBdiHgDQh2gDiMgbQkag0i3it");
	this.shape.setTransform(105.6,54.2797);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FF3333").s().p("ADdC1Qh1gDiMgbQkZg0i4isQChiYDNBAQBlAfBAAzQg0ANgzAYQAzgYA0gNQC4gsCiBnQBRAzAtA8QiMBaiEAAIgJAAg");
	this.shape_1.setTransform(109.2,90.467);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FFFF66").s().p("AGcGCQiihni4AsQhBgzhkgfQjNhAihCYQh2hxh+i3Qh+i4jcleQA0ApA/AqQg/gqg0gpQF+DuCsA6QLyEEMjlfQgvCRhZCqQiwFYjOCDQgtg9hRgzgAwfnxIAAAAg");
	this.shape_2.setTransform(105.6,49.8);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f().s("rgba(0,0,0,0.839)").ss(6,1,1).p("Aush4Qg/gpg0gqQF+DtCsA7QLyEEMjlg");
	this.shape_3.setTransform(105.6,20.3524);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_3}]},9).to({state:[{t:this.shape_3}]},10).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-3,-3,217.2,113.1);


(lib.charly_mouth_sailence = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("AwfoeQF+DuCsA7QLyEDMjlfQgvCRhYCsQixFWjOCDQgtg8hRg0Qiihni4AsQg1ANgyAYABCEaQhAgzhlgfQjNhAihCYQh3hwh9i3Qh+i4jclfQA0AqA/ApAIaHFQiRBdiHgDQh2gDiMgbQkag0i3it");
	this.shape.setTransform(105.6,54.2797);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FF3333").s().p("ADdC1Qh1gDiMgbQkZg0i4isQChiYDNBAQBlAfBAAzQg0ANgzAYQAzgYA0gNQC4gsCiBnQBRAzAtA8QiMBaiEAAIgJAAg");
	this.shape_1.setTransform(109.2,90.467);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FFFF66").s().p("AGcGCQiihni4AsQhBgzhkgfQjNhAihCYQh2hxh+i3Qh+i4jcleQA0ApA/AqQg/gqg0gpQF+DuCsA6QLyEEMjlfQgvCRhZCqQiwFYjOCDQgtg9hRgzgAwfnxIAAAAg");
	this.shape_2.setTransform(105.6,49.8);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.charly_mouth_sailence, new cjs.Rectangle(-1.5,-1.5,214.2,111.6), null);


(lib.start = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_2
	this.text = new cjs.Text("play", "normal 400 300px 'Lobster'");
	this.text.textAlign = "center";
	this.text.lineHeight = 449;
	this.text.lineWidth = 733;
	this.text.parent = this;
	this.text.setTransform(446.15,210.55);
	if(!lib.properties.webfonts['Lobster']) {
		lib.webFontTxtInst['Lobster'] = lib.webFontTxtInst['Lobster'] || [];
		lib.webFontTxtInst['Lobster'].push(this.text);
	}

	this.timeline.addTween(cjs.Tween.get(this.text).wait(1));

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#000000").ss(2,1,1).p("EBG0AAAQAAdV0vUvQ0vUv9WAAQ9VAA0v0vQ0v0vAA9VQAA9UUv0vQUv0vdVAAQdWAAUvUvQUvUvAAdUg");
	this.shape.setTransform(453.15,453.125);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("rgba(102,204,255,0.298)").s().p("EgyEAyEQ0v0vAA9VQAA9UUv0vQUw0vdUAAQdVAAUwUvQUuUvAAdUQAAdV0uUvQ0wUv9VAAQ9UAA0w0vg");
	this.shape_1.setTransform(453.15,453.125);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.start, new cjs.Rectangle(-1,-1,908.3,908.3), null);


(lib.repaly = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_2
	this.text = new cjs.Text("search \nagain", "normal 400 200px 'Lobster'");
	this.text.textAlign = "center";
	this.text.lineHeight = 300;
	this.text.lineWidth = 964;
	this.text.parent = this;
	this.text.setTransform(456.1,157.35);
	if(!lib.properties.webfonts['Lobster']) {
		lib.webFontTxtInst['Lobster'] = lib.webFontTxtInst['Lobster'] || [];
		lib.webFontTxtInst['Lobster'].push(this.text);
	}

	this.timeline.addTween(cjs.Tween.get(this.text).wait(1));

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#000000").ss(5,1,1).p("EBG0AAAQAAdV0vUvQ0vUv9WAAQ9VAA0v0vQ0v0vAA9VQAA9UUv0vQUv0vdVAAQdWAAUvUvQUvUvAAdUg");
	this.shape.setTransform(453.15,453.125);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("rgba(93,218,229,0.698)").s().p("EgyEAyEQ0v0vAA9VQAA9UUv0vQUw0vdUAAQdVAAUwUvQUuUvAAdUQAAdV0uUvQ0wUv9VAAQ9UAA0w0vg");
	this.shape_1.setTransform(453.15,453.125);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.repaly, new cjs.Rectangle(-28,-2.5,968.2,967.6), null);


(lib.sun2 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(50,50,50,0.098)").s().p("Egc3ExMQlLAAjqjqQjqjqAAlLMAAApJZQAAlLDqjqQDqjqFLAAMA5vAAAQFLAADqDqQDqDqAAFLMAAAJJZQAAFLjqDqQjqDqlLAAg");
	this.shape.setTransform(1794.7904,1176.7885,1,1,59.9992);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("rgba(182,242,252,0.098)").s().p("Egc3ExMQlLAAjqjqQjqjqAAlLMAAApJZQAAlLDqjqQDqjqFLAAMA5vAAAQFLAADqDqQDqDqAAFLMAAAJJZQAAFLjqDqQjqDqlLAAg");
	this.shape_1.setTransform(1794.7904,1176.7885,1,1,59.9992);
	this.shape_1._off = true;

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("rgba(182,242,252,0.298)").s().p("Egc3ExMQlLAAjqjqQjqjqAAlLMAAApJZQAAlLDqjqQDqjqFLAAMA5vAAAQFLAADqDqQDqDqAAFLMAAAJJZQAAFLjqDqQjqDqlLAAg");
	this.shape_2.setTransform(1794.7904,1176.7885,1,1,59.9992);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape}]}).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_2}]},1).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.shape).wait(33).to({_off:true},1).wait(77));
	this.timeline.addTween(cjs.Tween.get(this.shape_1).wait(34).to({_off:false},0).wait(75).to({_off:true},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0.1,0,3589.5,2353.6);


(lib.sun1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(182,242,252,0.098)").s().p("EAAADhkQlKAAjqjqQjqjqAAlLMAAAmqJQAAlLDqjqQDqjqFKAAIAAAAQFLAADqDqQDqDqAAFLMAAAGqJQAAFLjqDqQjqDqlLAAg");
	this.shape.setTransform(941.4738,941.4542,1,0.8975,45);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("rgba(182,242,252,0.298)").s().p("EAAADhkQlKAAjqjqQjqjqAAlLMAAAmqJQAAlLDqjqQDqjqFKAAIAAAAQFLAADqDqQDqDqAAFLMAAAGqJQAAFLjqDqQjqDqlLAAg");
	this.shape_1.setTransform(941.4738,941.4542,1,0.8975,45);
	this.shape_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(53).to({_off:true},1).wait(80).to({_off:false},0).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.shape_1).wait(54).to({_off:false},0).wait(79).to({_off:true},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,1882.9,1882.9);


(lib.small_fish = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("AwQvuQAlgoAhgSQCShSDOAAQBWAABMAOQBpAUBVAwQCRBRAABzQAABziRBSQhVAvhqAUQhLAOhWAAQjOAAiShRQg8gigjgnQgzg4AAhEQAAhYBMgygAwproQjJC/j9j1ID0iWIjIjmQGFh/AuErAkot0QAAAcgUAVQgVAUgdAAQgcAAgVgUQgUgVAAgcQAAgdAUgVQAVgUAcAAQAdAAAVAUQAUAVAAAdgAlJtxQAAAQgLAKQgLALgPAAQgPAAgLgLQgKgKAAgQQAAgPAKgKQALgLAPAAQAPAAALALQALAKAAAPgAnIxsQkaGVEZB7AJ3roQgzg4AAhEQAAhYBMgyQAkgoAigSQCShSDOAAQBWAABLAOQBqAUBVAwQCRBRAABzQAABziRBSQhWAvhpAUQhMAOhVAAQjOAAiShRQg8gigjgnQjKC/j9j1ID1iWIjJjmQGFh/AvErAVXtxQAAAQgLAKQgLALgPAAQgPAAgLgLQgKgKAAgQQAAgPAKgKQALgLAPAAQAPAAALALQALAKAAAPgAV4t0QAAAcgVAVQgUAUgdAAQgdAAgUgUQgUgVAAgcQAAgdAUgVQAUgUAdAAQAdAAAUAUQAVAVAAAdgATXxsQkZGVEZB7EAl9ABhQAAAPgLALQgKAKgPAAQgQAAgKgKQgLgLAAgPQAAgQALgKQAKgLAQAAQAPAAAKALQALAKAAAQgEAmeABdQAAAdgUAUQgVAUgcAAQgdAAgUgUQgVgUAAgdQAAgdAVgUQAUgVAdAAQAcAAAVAVQAUAUAAAdgEAj+gCZQBpAUBVAvQCSBRAABzQAABziSBRQhVAvhqAUQhLAOhWAAQjOAAiRhRQg8gigkgnQgyg4AAhDQAAhZBLgxQAlgnAigTQCRhSDOAAQBWAABMAPQkaGTEZB7AadDpQjJC/j9j1ID1iWIjJjlQGFh+AuEqAO+KjQBqAUBUAvQCSBRAAB0QAABziSBRQhVAvhpAUQhMAPhWAAQjOAAiRhSQg8ghgkgoQgyg4AAhDQAAhZBLgyQAlgnAigTQCRhSDOAAQBWAABMAPQkaGUEaB7AReOaQAAAdgUAUQgUAUgdAAQgdAAgUgUQgVgUAAgdQAAgdAVgUQAUgVAdAAQAdAAAUAVQAUAUAAAdgAQ9OeQAAAPgKALQgLAKgPAAQgPAAgLgKQgLgLAAgPQAAgPALgLQALgLAPAAQAPAAALALQAKALAAAPgAFRAXQAAAdgUAUQgVAVgcAAQgdAAgUgVQgVgUAAgdQAAgcAVgUQAUgUAdAAQAcAAAVAUQAUAUAAAcgAEwAbQAAAPgKALQgLAKgPAAQgQAAgKgKQgLgLAAgPQAAgPALgLQAKgKAQAAQAPAAALAKQAKALAAAPgAmWhiQAlgnAigTQCRhSDNAAQBWAABMAPQBpAUBVAvQCSBRAABzQAABziSBRQhVAwhqATQhLAPhWAAQjNAAiRhSQg8ghgkgnQjJC/j9j1ID1iWIjJjmQGFh+AuEqgACxjfQkZGTEYB7AmvCkQgyg5AAhDQAAhYBLgyAFdQmQjJC/j8j1ID0iWIjIjmQGEh+AuEqA4mjRQBqAUBUAvQCSBRAABzQAABziSBRQhVAwhpAUQhMAOhVAAQjPAAiRhSQg8ghgjgnQgzg4AAhEQAAhYBMgyQAkgnAigTQCRhRDPAAQBWAABLAOQkaGUEaB7A2mApQAAAPgLALQgLALgPAAQgPAAgLgLQgKgLAAgPQAAgPAKgLQALgLAPAAQAPAAALALQALALAAAPgA2GAlQAAAdgUAVQgUAUgdAAQgdAAgUgUQgVgVAAgdQAAgcAVgUQAUgUAdAAQAdAAAUAUQAUAUAAAcgEgiGACyQjKC/j9j1ID1iWIjJjlQGFh/AvEq");
	this.shape.setTransform(417.725,46.6297);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFFFFF").s().p("AI4OiQgKgLAAgPQAAgPAKgLQALgLAPAAQAPAAALALQALALAAAPQAAAPgLALQgLAKgPAAQgPAAgLgKgAd4BlQgKgLAAgPQAAgQAKgKQALgLAPAAQAPAAALALQALAKAAAQQAAAPgLALQgLAKgPAAQgPAAgLgKgA+rAtQgLgLAAgPQAAgPALgKQAKgLAPAAQAQAAAKALQALAKAAAPQAAAPgLALQgKALgQAAQgPAAgKgLgAjUAfQgKgLAAgPQAAgOAKgLQALgLAPAAQAPAAALALQALALAAAOQAAAPgLALQgLAKgPAAQgPAAgLgKgANSttQgLgKAAgQQAAgPALgKQAKgLAQAAQAPAAAKALQALAKAAAPQAAAQgLAKQgKALgPAAQgQAAgKgLgAtOttQgKgKAAgQQAAgPAKgKQALgLAPAAQAPAAALALQAKAKAAAPQAAAQgKAKQgLALgPAAQgPAAgLgLg");
	this.shape_1.setTransform(463.175,48.825);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#000000").s().p("AIiO5QgVgUAAgeQAAgcAVgUQAUgVAdAAQAdAAAUAVQAUAUAAAcQAAAegUAUQgUAUgdAAQgdAAgUgUgAI5NyQgLALAAAPQAAAPALALQALAKAPAAQAPAAALgKQAKgLAAgPQAAgPgKgLQgLgLgPAAQgPAAgLALgAdiB8QgVgUAAgeQAAgcAVgUQAUgVAdAAQAcAAAVAVQAUAUAAAcQAAAegUAUQgVAUgcAAQgdAAgUgUgAd5A1QgLAKAAAQQAAAPALAKQAKALAQAAQAPAAAKgLQALgKAAgPQAAgQgLgKQgKgLgPAAQgQAAgKALgA/CBEQgVgUAAgdQAAgbAVgVQAUgVAdAAQAdAAAUAVQAUAVAAAbQAAAdgUAUQgUAVgdAAQgdAAgUgVgA+rgCQgKAKAAAPQAAAPAKAKQALALAPAAQAPAAALgLQALgKAAgPQAAgPgLgKQgLgLgPAAQgPAAgLALgAjqA2QgVgUAAgdQAAgcAVgUQAUgVAdABQAcgBAVAVQAUAUAAAcQAAAdgUAUQgVAVgcgBQgdABgUgVgAjTgQQgLALAAAOQAAAPALALQAKAKAQAAQAPAAALgKQAKgLAAgPQAAgOgKgLQgLgLgPAAQgQAAgKALgAM7tVQgUgVAAgdQAAgcAUgVQAUgUAdAAQAdAAAUAUQAVAVAAAcQAAAdgVAVQgUAUgdAAQgdAAgUgUgANSudQgKALAAAPQAAAPAKALQALALAPAAQAPAAALgLQALgLAAgPQAAgPgLgLQgLgLgPABQgPgBgLALgAtltVQgUgVAAgdQAAgcAUgVQAVgUAcAAQAdAAAVAUQAUAVAAAcQAAAdgUAVQgVAUgdAAQgcAAgVgUgAtOudQgKALAAAPQAAAPAKALQALALAPAAQAPAAALgLQALgLAAgPQAAgPgLgLQgLgLgPABQgPgBgLALg");
	this.shape_2.setTransform(463.125,48.45);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#EE7C4A").s().p("AG9RvQg8ghgkgoQgyg4AAhDQAAhZBLgyQAlgnAigTQCRhSDOAAQBWAABMAPQiNDKAACEQAACECNA9QhMAPhWAAQjOAAiRhSgAO+SyQiNg9AAiEQAAiECNjKQBqAUBUAvQCSBRAAB0QAABziSBRQhVAvhpAUIAAAAgAPoNpQgVAUAAAdQAAAdAVAUQAUAUAdAAQAdAAAUgUQAUgUAAgdQAAgdgUgUQgUgVgdAAQgdAAgUAVgAhoPwID0iWIjIjmQGEh+AuEqQhLAyAABZQAABDAyA4QhYBUhiAAQh+AAiNiKgAFdQmIAAAAgAO+KjIAAAAgAb9EyQg8gigkgnQgyg4AAhDQAAhZBLgxQAlgnAigTQCRhSDOAAQBWAABMAPQiNDJAACEQgBCECNA9QhLAOhWAAQjOAAiRhRgEAj9AF1IAAAAgEAhxAC0QAAiECNjJQBpAUBVAvQCSBRAABzQAABziSBRQhVAvhqAUQiNg9ABiEgEAkoAAsQgVAUAAAdQAAAdAVAUQAUAUAdAAQAcAAAVgUQAUgUAAgdQAAgdgUgUQgVgVgcAAQgdAAgUAVgEggnAD6Qg8ghgjgnQgzg4AAhEQAAhYBMgyQAkgnAigTQCRhRDPAAQBWAABLAOQiNDKAACDQAACECNA+QhMAOhVAAQjPAAiRhSgAlPDsQg8ghgkgnQjJC/j9j1ID1iWIjJjmQGFh+AuEqQhLAyAABYQAABDAyA5Qgyg5AAhDQAAhYBLgyQAlgnAigTQCRhSDNAAQBWAABMAPQBpAUBVAvQCSBRAABzQAABziSBRQhVAwhqATQiMg9AAiEQAAiDCNjKQiNDKAACDQAACECMA9QhLAPhWAAQjNAAiRhSgADbgZQgVAUAAAcQAAAdAVAUQAUAVAdAAQAcAAAVgVQAUgUAAgdQAAgcgUgUQgVgUgcAAQgdAAgUAUgA4mE+QiNg+AAiEQAAiDCNjKQBqAUBUAvQCSBRAABzQAABziSBRQhVAwhpAUIAAAAgA38gLQgVAUAAAcQAAAdAVAVQAUAUAdAAQAdAAAUgUQAUgVAAgdQAAgcgUgUQgUgUgdAAQgdAAgUAUgATXCzID1iWIjJjlQGFh+AuEqQhLAxAABZQAABDAyA4QhYBUhiAAQh+AAiOiKgEgpNAB8ID1iWIjJjlQGFh/AvEqQhMAyAABYQAABEAzA4QhZBThiAAQh+AAiOiJgEgiGACyIAAAAgAa2gcIAAAAgAmWhiIAAAAgA4mjRIAAAAgALWqfQg8gigjgnQgzg4AAhEQAAhYBMgyQAkgoAigSQCShSDOAAQBWAABLAOQBqAUBVAwQCRBRAABzQAABziRBSQhWAvhpAUQiNg+AAiEQAAiECNjKQiNDKAACEQAACECNA+QhMAOhVAAQjOAAiShRgAUBumQgUAVAAAdQAAAcAUAVQAUAUAdAAQAdAAAUgUQAVgVAAgcQAAgdgVgVQgUgUgdAAQgdAAgUAUgAvKqfQg8gigjgnQjJC/j9j1ID0iWIjIjmQGFh/AuErQhMAyAABYQAABEAzA4Qgzg4AAhEQAAhYBMgyQAlgoAhgSQCShSDOAAQBWAABMAOQBpAUBVAwQCRBRAABzQAABziRBSQhVAvhqAUQiMg+AAiEQAAiECNjKQiNDKAACEQAACECMA+QhLAOhWAAQjOAAiShRgAmfumQgUAVAAAdQAAAcAUAVQAVAUAcAAQAdAAAVgUQAUgVAAgcQAAgdgUgVQgVgUgdAAQgcAAgVAUgATXpcIAAAAgACwseID1iWIjJjmQGFh/AvErQhMAyAABYQAABEAzA4QhZBUhiAAQh+AAiOiKgAKQvuIAAAAg");
	this.shape_3.setTransform(417.725,46.6297);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.small_fish, new cjs.Rectangle(152.5,-76.5,530.5,246.3), null);


(lib.bubbles2 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(255,244,180,0.4)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape.setTransform(-1878.15,2157.9);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("rgba(255,244,180,0.396)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_1.setTransform(-1877.15,2123.45);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("rgba(255,244,180,0.392)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_2.setTransform(-1876.15,2089.05);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("rgba(255,244,180,0.388)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_3.setTransform(-1874.7,2037.45);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("rgba(255,244,180,0.384)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_4.setTransform(-1873.7,2003);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("rgba(255,244,180,0.38)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_5.setTransform(-1872.2,1951.4);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("rgba(255,244,180,0.376)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_6.setTransform(-1871.2,1917);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("rgba(255,244,180,0.373)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_7.setTransform(-1869.75,1865.35);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("rgba(255,244,180,0.369)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_8.setTransform(-1868.75,1830.9);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("rgba(255,244,180,0.365)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_9.setTransform(-1867.25,1779.3);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("rgba(255,244,180,0.361)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_10.setTransform(-1866.25,1744.9);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("rgba(255,244,180,0.357)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_11.setTransform(-1864.8,1693.25);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("rgba(255,244,180,0.353)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_12.setTransform(-1863.8,1658.85);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("rgba(255,244,180,0.349)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_13.setTransform(-1862.3,1607.25);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("rgba(255,244,180,0.345)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_14.setTransform(-1860.8,1555.6);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("rgba(255,244,180,0.341)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_15.setTransform(-1859.85,1521.15);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("rgba(255,244,180,0.337)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_16.setTransform(-1858.35,1469.55);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("rgba(255,244,180,0.333)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_17.setTransform(-1857.35,1435.15);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f("rgba(255,244,180,0.329)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_18.setTransform(-1855.85,1383.5);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f("rgba(255,244,180,0.325)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_19.setTransform(-1854.9,1349.1);

	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f("rgba(255,244,180,0.322)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_20.setTransform(-1853.4,1297.45);

	this.shape_21 = new cjs.Shape();
	this.shape_21.graphics.f("rgba(255,244,180,0.318)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_21.setTransform(-1852.4,1263.05);

	this.shape_22 = new cjs.Shape();
	this.shape_22.graphics.f("rgba(255,244,180,0.314)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_22.setTransform(-1850.9,1211.4);

	this.shape_23 = new cjs.Shape();
	this.shape_23.graphics.f("rgba(255,244,180,0.31)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_23.setTransform(-1849.9,1177);

	this.shape_24 = new cjs.Shape();
	this.shape_24.graphics.f("rgba(255,244,180,0.306)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_24.setTransform(-1848.45,1125.35);

	this.shape_25 = new cjs.Shape();
	this.shape_25.graphics.f("rgba(255,244,180,0.302)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_25.setTransform(-1847.45,1090.95);

	this.shape_26 = new cjs.Shape();
	this.shape_26.graphics.f("rgba(255,244,180,0.298)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_26.setTransform(-1845.95,1039.35);

	this.shape_27 = new cjs.Shape();
	this.shape_27.graphics.f("rgba(255,244,180,0.294)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_27.setTransform(-1844.95,1004.9);

	this.shape_28 = new cjs.Shape();
	this.shape_28.graphics.f("rgba(255,244,180,0.29)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_28.setTransform(-1843.5,953.25);

	this.shape_29 = new cjs.Shape();
	this.shape_29.graphics.f("rgba(255,244,180,0.286)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_29.setTransform(-1842.5,918.85);

	this.shape_30 = new cjs.Shape();
	this.shape_30.graphics.f("rgba(255,244,180,0.282)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_30.setTransform(-1841,867.25);

	this.shape_31 = new cjs.Shape();
	this.shape_31.graphics.f("rgba(255,244,180,0.278)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_31.setTransform(-1840,832.8);

	this.shape_32 = new cjs.Shape();
	this.shape_32.graphics.f("rgba(255,244,180,0.275)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_32.setTransform(-1838.55,781.2);

	this.shape_33 = new cjs.Shape();
	this.shape_33.graphics.f("rgba(255,244,180,0.271)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_33.setTransform(-1837.55,746.8);

	this.shape_34 = new cjs.Shape();
	this.shape_34.graphics.f("rgba(255,244,180,0.267)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_34.setTransform(-1836.05,695.15);

	this.shape_35 = new cjs.Shape();
	this.shape_35.graphics.f("rgba(255,244,180,0.263)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_35.setTransform(-1835.05,660.7);

	this.shape_36 = new cjs.Shape();
	this.shape_36.graphics.f("rgba(255,244,180,0.259)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_36.setTransform(-1833.6,609.1);

	this.shape_37 = new cjs.Shape();
	this.shape_37.graphics.f("rgba(255,244,180,0.255)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_37.setTransform(-1832.6,574.7);

	this.shape_38 = new cjs.Shape();
	this.shape_38.graphics.f("rgba(255,244,180,0.251)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_38.setTransform(-1831.1,523.05);

	this.shape_39 = new cjs.Shape();
	this.shape_39.graphics.f("rgba(255,244,180,0.247)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_39.setTransform(-1830.1,488.65);

	this.shape_40 = new cjs.Shape();
	this.shape_40.graphics.f("rgba(255,244,180,0.243)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_40.setTransform(-1828.65,437.05);

	this.shape_41 = new cjs.Shape();
	this.shape_41.graphics.f("rgba(255,244,180,0.239)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_41.setTransform(-1827.15,385.4);

	this.shape_42 = new cjs.Shape();
	this.shape_42.graphics.f("rgba(255,244,180,0.235)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_42.setTransform(-1826.15,350.95);

	this.shape_43 = new cjs.Shape();
	this.shape_43.graphics.f("rgba(255,244,180,0.231)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_43.setTransform(-1824.65,299.35);

	this.shape_44 = new cjs.Shape();
	this.shape_44.graphics.f("rgba(255,244,180,0.227)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_44.setTransform(-1823.7,264.95);

	this.shape_45 = new cjs.Shape();
	this.shape_45.graphics.f("rgba(255,244,180,0.224)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_45.setTransform(-1822.2,213.3);

	this.shape_46 = new cjs.Shape();
	this.shape_46.graphics.f("rgba(255,244,180,0.22)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_46.setTransform(-1821.2,178.9);

	this.shape_47 = new cjs.Shape();
	this.shape_47.graphics.f("rgba(255,244,180,0.216)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_47.setTransform(-1819.7,127.25);

	this.shape_48 = new cjs.Shape();
	this.shape_48.graphics.f("rgba(255,244,180,0.212)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_48.setTransform(-1818.7,92.85);

	this.shape_49 = new cjs.Shape();
	this.shape_49.graphics.f("rgba(255,244,180,0.208)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_49.setTransform(-1817.25,41.2);

	this.shape_50 = new cjs.Shape();
	this.shape_50.graphics.f("rgba(255,244,180,0.204)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_50.setTransform(-1816.25,6.8);

	this.shape_51 = new cjs.Shape();
	this.shape_51.graphics.f("rgba(255,244,180,0.2)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_51.setTransform(-1814.75,-44.85);

	this.shape_52 = new cjs.Shape();
	this.shape_52.graphics.f("rgba(255,244,180,0.196)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_52.setTransform(-1813.75,-79.25);

	this.shape_53 = new cjs.Shape();
	this.shape_53.graphics.f("rgba(255,244,180,0.192)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_53.setTransform(-1812.3,-130.85);

	this.shape_54 = new cjs.Shape();
	this.shape_54.graphics.f("rgba(255,244,180,0.188)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_54.setTransform(-1811.3,-165.3);

	this.shape_55 = new cjs.Shape();
	this.shape_55.graphics.f("rgba(255,244,180,0.184)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_55.setTransform(-1809.9,-213.7);

	this.shape_56 = new cjs.Shape();
	this.shape_56.graphics.f("rgba(255,244,180,0.18)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_56.setTransform(-1808.1,-276.1);

	this.shape_57 = new cjs.Shape();
	this.shape_57.graphics.f("rgba(255,244,180,0.176)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_57.setTransform(-1807.2,-307.3);

	this.shape_58 = new cjs.Shape();
	this.shape_58.graphics.f("rgba(255,244,180,0.173)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_58.setTransform(-1806.3,-338.5);

	this.shape_59 = new cjs.Shape();
	this.shape_59.graphics.f("rgba(255,244,180,0.169)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_59.setTransform(-1804.5,-400.9);

	this.shape_60 = new cjs.Shape();
	this.shape_60.graphics.f("rgba(255,244,180,0.165)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_60.setTransform(-1803.65,-432.15);

	this.shape_61 = new cjs.Shape();
	this.shape_61.graphics.f("rgba(255,244,180,0.161)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_61.setTransform(-1801.85,-494.55);

	this.shape_62 = new cjs.Shape();
	this.shape_62.graphics.f("rgba(255,244,180,0.157)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_62.setTransform(-1800.95,-525.75);

	this.shape_63 = new cjs.Shape();
	this.shape_63.graphics.f("rgba(255,244,180,0.153)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_63.setTransform(-1800.05,-556.95);

	this.shape_64 = new cjs.Shape();
	this.shape_64.graphics.f("rgba(255,244,180,0.149)").s().p("AsIMJQlClCAAnHQAAnGFClCQFClCHGAAQHHAAFCFCQFCFCAAHGQAAHHlCFCQlCFCnHAAQnGAAlClCg");
	this.shape_64.setTransform(-1798.25,-619.35);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape,p:{x:-1878.15,y:2157.9}}]}).to({state:[{t:this.shape,p:{x:-1877.65,y:2140.7}}]},1).to({state:[{t:this.shape_1,p:{x:-1877.15,y:2123.45}}]},1).to({state:[{t:this.shape_1,p:{x:-1876.65,y:2106.25}}]},1).to({state:[{t:this.shape_2,p:{x:-1876.15,y:2089.05}}]},1).to({state:[{t:this.shape_2,p:{x:-1875.65,y:2071.85}}]},1).to({state:[{t:this.shape_2,p:{x:-1875.2,y:2054.65}}]},1).to({state:[{t:this.shape_3,p:{x:-1874.7,y:2037.45}}]},1).to({state:[{t:this.shape_3,p:{x:-1874.2,y:2020.25}}]},1).to({state:[{t:this.shape_4,p:{x:-1873.7,y:2003}}]},1).to({state:[{t:this.shape_4,p:{x:-1873.2,y:1985.8}}]},1).to({state:[{t:this.shape_4,p:{x:-1872.7,y:1968.6}}]},1).to({state:[{t:this.shape_5,p:{x:-1872.2,y:1951.4}}]},1).to({state:[{t:this.shape_5,p:{x:-1871.7,y:1934.2}}]},1).to({state:[{t:this.shape_6,p:{x:-1871.2,y:1917}}]},1).to({state:[{t:this.shape_6,p:{x:-1870.7,y:1899.8}}]},1).to({state:[{t:this.shape_6,p:{x:-1870.25,y:1882.55}}]},1).to({state:[{t:this.shape_7,p:{x:-1869.75,y:1865.35}}]},1).to({state:[{t:this.shape_7,p:{x:-1869.25,y:1848.15}}]},1).to({state:[{t:this.shape_8,p:{x:-1868.75,y:1830.9}}]},1).to({state:[{t:this.shape_8,p:{x:-1868.25,y:1813.7}}]},1).to({state:[{t:this.shape_8,p:{x:-1867.75,y:1796.5}}]},1).to({state:[{t:this.shape_9,p:{x:-1867.25,y:1779.3}}]},1).to({state:[{t:this.shape_9,p:{x:-1866.75,y:1762.1}}]},1).to({state:[{t:this.shape_10,p:{x:-1866.25,y:1744.9}}]},1).to({state:[{t:this.shape_10,p:{x:-1865.75,y:1727.7}}]},1).to({state:[{t:this.shape_10,p:{x:-1865.25,y:1710.45}}]},1).to({state:[{t:this.shape_11,p:{x:-1864.8,y:1693.25}}]},1).to({state:[{t:this.shape_11,p:{x:-1864.3,y:1676.05}}]},1).to({state:[{t:this.shape_12,p:{x:-1863.8,y:1658.85}}]},1).to({state:[{t:this.shape_12,p:{x:-1863.3,y:1641.65}}]},1).to({state:[{t:this.shape_12,p:{x:-1862.8,y:1624.45}}]},1).to({state:[{t:this.shape_13,p:{x:-1862.3,y:1607.25}}]},1).to({state:[{t:this.shape_13,p:{x:-1861.8,y:1590}}]},1).to({state:[{t:this.shape_13,p:{x:-1861.3,y:1572.8}}]},1).to({state:[{t:this.shape_14,p:{x:-1860.8,y:1555.6}}]},1).to({state:[{t:this.shape_14,p:{x:-1860.3,y:1538.35}}]},1).to({state:[{t:this.shape_15,p:{x:-1859.85,y:1521.15}}]},1).to({state:[{t:this.shape_15,p:{x:-1859.35,y:1503.95}}]},1).to({state:[{t:this.shape_15,p:{x:-1858.85,y:1486.75}}]},1).to({state:[{t:this.shape_16,p:{x:-1858.35,y:1469.55}}]},1).to({state:[{t:this.shape_16,p:{x:-1857.85,y:1452.35}}]},1).to({state:[{t:this.shape_17,p:{x:-1857.35,y:1435.15}}]},1).to({state:[{t:this.shape_17,p:{x:-1856.85,y:1417.9}}]},1).to({state:[{t:this.shape_17,p:{x:-1856.35,y:1400.7}}]},1).to({state:[{t:this.shape_18,p:{x:-1855.85,y:1383.5}}]},1).to({state:[{t:this.shape_18,p:{x:-1855.35,y:1366.3}}]},1).to({state:[{t:this.shape_19,p:{x:-1854.9,y:1349.1}}]},1).to({state:[{t:this.shape_19,p:{x:-1854.4,y:1331.9}}]},1).to({state:[{t:this.shape_19,p:{x:-1853.9,y:1314.7}}]},1).to({state:[{t:this.shape_20,p:{x:-1853.4,y:1297.45}}]},1).to({state:[{t:this.shape_20,p:{x:-1852.9,y:1280.25}}]},1).to({state:[{t:this.shape_21,p:{x:-1852.4,y:1263.05}}]},1).to({state:[{t:this.shape_21,p:{x:-1851.9,y:1245.8}}]},1).to({state:[{t:this.shape_21,p:{x:-1851.4,y:1228.6}}]},1).to({state:[{t:this.shape_22,p:{x:-1850.9,y:1211.4}}]},1).to({state:[{t:this.shape_22,p:{x:-1850.4,y:1194.2}}]},1).to({state:[{t:this.shape_23,p:{x:-1849.9,y:1177}}]},1).to({state:[{t:this.shape_23,p:{x:-1849.45,y:1159.8}}]},1).to({state:[{t:this.shape_23,p:{x:-1848.95,y:1142.6}}]},1).to({state:[{t:this.shape_24,p:{x:-1848.45,y:1125.35}}]},1).to({state:[{t:this.shape_24,p:{x:-1847.95,y:1108.15}}]},1).to({state:[{t:this.shape_25,p:{x:-1847.45,y:1090.95}}]},1).to({state:[{t:this.shape_25,p:{x:-1846.95,y:1073.75}}]},1).to({state:[{t:this.shape_25,p:{x:-1846.45,y:1056.55}}]},1).to({state:[{t:this.shape_26,p:{x:-1845.95,y:1039.35}}]},1).to({state:[{t:this.shape_26,p:{x:-1845.45,y:1022.15}}]},1).to({state:[{t:this.shape_27,p:{x:-1844.95,y:1004.9}}]},1).to({state:[{t:this.shape_27,p:{x:-1844.45,y:987.7}}]},1).to({state:[{t:this.shape_27,p:{x:-1844,y:970.5}}]},1).to({state:[{t:this.shape_28,p:{x:-1843.5,y:953.25}}]},1).to({state:[{t:this.shape_28,p:{x:-1843,y:936.05}}]},1).to({state:[{t:this.shape_29,p:{x:-1842.5,y:918.85}}]},1).to({state:[{t:this.shape_29,p:{x:-1842,y:901.65}}]},1).to({state:[{t:this.shape_29,p:{x:-1841.5,y:884.45}}]},1).to({state:[{t:this.shape_30,p:{x:-1841,y:867.25}}]},1).to({state:[{t:this.shape_30,p:{x:-1840.5,y:850.05}}]},1).to({state:[{t:this.shape_31,p:{x:-1840,y:832.8}}]},1).to({state:[{t:this.shape_31,p:{x:-1839.5,y:815.6}}]},1).to({state:[{t:this.shape_31,p:{x:-1839.05,y:798.4}}]},1).to({state:[{t:this.shape_32,p:{x:-1838.55,y:781.2}}]},1).to({state:[{t:this.shape_32,p:{x:-1838.05,y:764}}]},1).to({state:[{t:this.shape_33,p:{x:-1837.55,y:746.8}}]},1).to({state:[{t:this.shape_33,p:{x:-1837.05,y:729.6}}]},1).to({state:[{t:this.shape_33,p:{x:-1836.55,y:712.35}}]},1).to({state:[{t:this.shape_34,p:{x:-1836.05,y:695.15}}]},1).to({state:[{t:this.shape_34,p:{x:-1835.55,y:677.95}}]},1).to({state:[{t:this.shape_35,p:{x:-1835.05,y:660.7}}]},1).to({state:[{t:this.shape_35,p:{x:-1834.55,y:643.5}}]},1).to({state:[{t:this.shape_35,p:{x:-1834.05,y:626.3}}]},1).to({state:[{t:this.shape_36,p:{x:-1833.6,y:609.1}}]},1).to({state:[{t:this.shape_36,p:{x:-1833.1,y:591.9}}]},1).to({state:[{t:this.shape_37,p:{x:-1832.6,y:574.7}}]},1).to({state:[{t:this.shape_37,p:{x:-1832.1,y:557.5}}]},1).to({state:[{t:this.shape_37,p:{x:-1831.6,y:540.25}}]},1).to({state:[{t:this.shape_38,p:{x:-1831.1,y:523.05}}]},1).to({state:[{t:this.shape_38,p:{x:-1830.6,y:505.85}}]},1).to({state:[{t:this.shape_39,p:{x:-1830.1,y:488.65}}]},1).to({state:[{t:this.shape_39,p:{x:-1829.6,y:471.45}}]},1).to({state:[{t:this.shape_39,p:{x:-1829.1,y:454.25}}]},1).to({state:[{t:this.shape_40,p:{x:-1828.65,y:437.05}}]},1).to({state:[{t:this.shape_40,p:{x:-1828.15,y:419.8}}]},1).to({state:[{t:this.shape_40,p:{x:-1827.65,y:402.6}}]},1).to({state:[{t:this.shape_41,p:{x:-1827.15,y:385.4}}]},1).to({state:[{t:this.shape_41,p:{x:-1826.65,y:368.15}}]},1).to({state:[{t:this.shape_42,p:{x:-1826.15,y:350.95}}]},1).to({state:[{t:this.shape_42,p:{x:-1825.65,y:333.75}}]},1).to({state:[{t:this.shape_42,p:{x:-1825.15,y:316.55}}]},1).to({state:[{t:this.shape_43,p:{x:-1824.65,y:299.35}}]},1).to({state:[{t:this.shape_43,p:{x:-1824.15,y:282.15}}]},1).to({state:[{t:this.shape_44,p:{x:-1823.7,y:264.95}}]},1).to({state:[{t:this.shape_44,p:{x:-1823.2,y:247.7}}]},1).to({state:[{t:this.shape_44,p:{x:-1822.7,y:230.5}}]},1).to({state:[{t:this.shape_45,p:{x:-1822.2,y:213.3}}]},1).to({state:[{t:this.shape_45,p:{x:-1821.7,y:196.1}}]},1).to({state:[{t:this.shape_46,p:{x:-1821.2,y:178.9}}]},1).to({state:[{t:this.shape_46,p:{x:-1820.7,y:161.7}}]},1).to({state:[{t:this.shape_46,p:{x:-1820.2,y:144.5}}]},1).to({state:[{t:this.shape_47,p:{x:-1819.7,y:127.25}}]},1).to({state:[{t:this.shape_47,p:{x:-1819.2,y:110.05}}]},1).to({state:[{t:this.shape_48,p:{x:-1818.7,y:92.85}}]},1).to({state:[{t:this.shape_48,p:{x:-1818.25,y:75.6}}]},1).to({state:[{t:this.shape_48,p:{x:-1817.75,y:58.4}}]},1).to({state:[{t:this.shape_49,p:{x:-1817.25,y:41.2}}]},1).to({state:[{t:this.shape_49,p:{x:-1816.75,y:24}}]},1).to({state:[{t:this.shape_50,p:{x:-1816.25,y:6.8}}]},1).to({state:[{t:this.shape_50,p:{x:-1815.75,y:-10.4}}]},1).to({state:[{t:this.shape_50,p:{x:-1815.25,y:-27.6}}]},1).to({state:[{t:this.shape_51,p:{x:-1814.75,y:-44.85}}]},1).to({state:[{t:this.shape_51,p:{x:-1814.25,y:-62.05}}]},1).to({state:[{t:this.shape_52,p:{x:-1813.75,y:-79.25}}]},1).to({state:[{t:this.shape_52,p:{x:-1813.3,y:-96.45}}]},1).to({state:[{t:this.shape_52,p:{x:-1812.8,y:-113.65}}]},1).to({state:[{t:this.shape_53,p:{x:-1812.3,y:-130.85}}]},1).to({state:[{t:this.shape_53,p:{x:-1811.8,y:-148.05}}]},1).to({state:[{t:this.shape_54,p:{x:-1811.3,y:-165.3}}]},1).to({state:[{t:this.shape_54,p:{x:-1810.8,y:-182.5}}]},1).to({state:[{t:this.shape_55,p:{x:-1809.9,y:-213.7}}]},1).to({state:[{t:this.shape_55,p:{x:-1809,y:-244.9}}]},1).to({state:[{t:this.shape_56}]},1).to({state:[{t:this.shape_57}]},1).to({state:[{t:this.shape_58,p:{x:-1806.3,y:-338.5}}]},1).to({state:[{t:this.shape_58,p:{x:-1805.4,y:-369.7}}]},1).to({state:[{t:this.shape_59}]},1).to({state:[{t:this.shape_60,p:{x:-1803.65,y:-432.15}}]},1).to({state:[{t:this.shape_60,p:{x:-1802.75,y:-463.35}}]},1).to({state:[{t:this.shape_61}]},1).to({state:[{t:this.shape_62}]},1).to({state:[{t:this.shape_63,p:{x:-1800.05,y:-556.95}}]},1).to({state:[{t:this.shape_63,p:{x:-1799.15,y:-588.15}}]},1).to({state:[{t:this.shape_64}]},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1988,-729.2,299.70000000000005,2997);


(lib.bubbles1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(255,255,204,0.298)").s().p("ApGJHQjyjyAAlVQAAlUDyjyQDyjyFUAAQFVAADyDyQDyDygBFUQABFVjyDyQjyDylVgBQlUABjyjyg");
	this.shape.setTransform(232.3,2460.15);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("rgba(255,255,204,0.298)").s().p("ApGJHQjyjxABlWQgBlUDyjyQDyjyFUAAQFVAADyDyQDyDygBFUQABFWjyDxQjyDxlVAAQlUAAjyjxg");
	this.shape_1.setTransform(232.55,2429.5);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("rgba(255,255,204,0.302)").s().p("ApGJHQjxjxgBlWQABlVDxjxQDxjyFVAAQFWAADxDyQDxDxAAFVQAAFWjxDxQjxDxlWAAQlVAAjxjxg");
	this.shape_2.setTransform(232.85,2398.8);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("rgba(255,255,204,0.302)").s().p("ApGJHQjyjyABlVQgBlVDyjxQDyjxFUgBQFVABDyDxQDyDxgBFVQABFVjyDyQjyDxlVAAQlUAAjyjxg");
	this.shape_3.setTransform(233.1,2368.2);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("rgba(255,255,204,0.302)").s().p("ApGJHQjxjxgBlWQABlUDxjyQDxjxFVAAQFWAADxDxQDxDyAAFUQAAFWjxDxQjxDxlWAAQlVAAjxjxg");
	this.shape_4.setTransform(233.4,2337.55);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("rgba(255,255,204,0.306)").s().p("ApGJHQjyjxAAlWQAAlVDyjxQDyjyFUAAQFVAADyDyQDyDxgBFVQABFWjyDxQjyDxlVABQlUgBjyjxg");
	this.shape_5.setTransform(233.65,2306.85);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("rgba(255,255,204,0.306)").s().p("ApGJHQjyjyAAlVQAAlVDyjxQDyjyFUABQFWgBDxDyQDyDxAAFVQAAFVjyDyQjxDxlWAAQlUAAjyjxg");
	this.shape_6.setTransform(233.95,2276.2);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("rgba(255,255,204,0.306)").s().p("ApGJHQjxjygBlVQABlVDxjxQDxjyFVAAQFWAADxDyQDxDxAAFVQAAFVjxDyQjxDxlWABQlVgBjxjxg");
	this.shape_7.setTransform(234.2,2245.55);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("rgba(255,255,204,0.31)").s().p("ApGJHQjyjyAAlVQAAlUDyjyQDxjyFVAAQFVAADyDyQDyDyAAFUQAAFVjyDyQjyDylVgBQlVABjxjyg");
	this.shape_8.setTransform(234.5,2214.9);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("rgba(255,255,204,0.31)").s().p("ApGJHQjxjxgBlWQABlUDxjyQDxjyFVAAQFWAADxDyQDxDyAAFUQAAFWjxDxQjxDxlWAAQlVAAjxjxg");
	this.shape_9.setTransform(234.75,2184.25);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("rgba(255,255,204,0.314)").s().p("ApGJHQjxjyAAlVQAAlVDxjxQDxjyFVABQFWgBDxDyQDxDxABFVQgBFVjxDyQjxDxlWABQlVgBjxjxg");
	this.shape_10.setTransform(235.05,2153.6);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("rgba(255,255,204,0.314)").s().p("ApGJHQjyjyAAlVQAAlVDyjxQDyjxFUgBQFWABDxDxQDyDxAAFVQAAFVjyDyQjxDxlWAAQlUAAjyjxg");
	this.shape_11.setTransform(235.3,2122.95);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("rgba(255,255,204,0.314)").s().p("ApGJHQjxjxAAlWQAAlUDxjyQDxjxFVAAQFWAADxDxQDxDyABFUQgBFWjxDxQjxDxlWAAQlVAAjxjxg");
	this.shape_12.setTransform(235.6,2092.3);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("rgba(255,255,204,0.318)").s().p("ApGJHQjyjxAAlWQAAlVDyjxQDxjxFVAAQFVAADyDxQDyDxAAFVQAAFWjyDxQjyDxlVABQlVgBjxjxg");
	this.shape_13.setTransform(235.85,2061.6);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("rgba(255,255,204,0.318)").s().p("ApGJHQjyjyABlVQgBlUDyjyQDyjyFUAAQFVAADyDyQDyDyAAFUQAAFVjyDyQjyDxlVAAQlUAAjyjxg");
	this.shape_14.setTransform(236.15,2030.95);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("rgba(255,255,204,0.318)").s().p("ApGJHQjxjyAAlVQAAlUDxjyQDxjyFVABQFWgBDxDyQDxDyABFUQgBFVjxDyQjxDylWgBQlVABjxjyg");
	this.shape_15.setTransform(236.4,2000.35);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("rgba(255,255,204,0.322)").s().p("ApGJHQjyjyABlVQgBlUDyjyQDyjyFUABQFVgBDyDyQDyDygBFUQABFVjyDyQjyDylVgBQlUABjyjyg");
	this.shape_16.setTransform(236.7,1969.65);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("rgba(255,255,204,0.322)").s().p("ApGJHQjxjxAAlWQAAlUDxjyQDxjyFVAAQFWAADxDyQDxDxABFVQgBFWjxDxQjxDxlWAAQlVAAjxjxg");
	this.shape_17.setTransform(236.95,1939);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f("rgba(255,255,204,0.325)").s().p("ApGJHQjyjxABlWQgBlVDyjxQDyjyFUAAQFVAADyDyQDyDxgBFVQABFWjyDxQjyDxlVAAQlUAAjyjxg");
	this.shape_18.setTransform(237.5,1877.7);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f("rgba(255,255,204,0.325)").s().p("ApGJHQjxjxgBlWQABlVDxjxQDxjxFVAAQFWAADxDxQDxDxAAFVQAAFWjxDxQjxDxlWABQlVgBjxjxg");
	this.shape_19.setTransform(237.8,1847.05);

	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f("rgba(255,255,204,0.325)").s().p("ApGJHQjyjyABlVQgBlVDyjxQDyjxFUgBQFVABDyDxQDyDxgBFVQABFVjyDyQjyDxlVAAQlUAAjyjxg");
	this.shape_20.setTransform(238.05,1816.4);

	this.shape_21 = new cjs.Shape();
	this.shape_21.graphics.f("rgba(255,255,204,0.329)").s().p("ApGJHQjxjygBlVQABlUDxjyQDxjyFVAAQFWAADxDyQDxDyAAFUQAAFVjxDyQjxDylWgBQlVABjxjyg");
	this.shape_21.setTransform(238.35,1785.7);

	this.shape_22 = new cjs.Shape();
	this.shape_22.graphics.f("rgba(255,255,204,0.329)").s().p("ApGJHQjyjyAAlVQAAlUDyjyQDyjyFUABQFVgBDyDyQDyDygBFUQABFVjyDyQjyDylVgBQlUABjyjyg");
	this.shape_22.setTransform(238.6,1755.1);

	this.shape_23 = new cjs.Shape();
	this.shape_23.graphics.f("rgba(255,255,204,0.333)").s().p("ApGJHQjyjyAAlVQAAlUDyjyQDyjyFUABQFWgBDxDyQDyDyAAFUQAAFVjyDyQjxDylWgBQlUABjyjyg");
	this.shape_23.setTransform(238.9,1724.4);

	this.shape_24 = new cjs.Shape();
	this.shape_24.graphics.f("rgba(255,255,204,0.333)").s().p("ApGJHQjxjxgBlWQABlUDxjyQDxjyFVAAQFWAADxDyQDxDxAAFVQAAFWjxDxQjxDxlWAAQlVAAjxjxg");
	this.shape_24.setTransform(239.15,1693.75);

	this.shape_25 = new cjs.Shape();
	this.shape_25.graphics.f("rgba(255,255,204,0.333)").s().p("ApGJHQjyjyABlVQgBlUDyjyQDyjyFUABQFVgBDyDyQDyDygBFUQABFVjyDyQjyDylVgBQlUABjyjyg");
	this.shape_25.setTransform(239.4,1663.1);

	this.shape_26 = new cjs.Shape();
	this.shape_26.graphics.f("rgba(255,255,204,0.337)").s().p("ApGJHQjxjxgBlWQABlVDxjxQDxjyFVAAQFWAADxDyQDxDxAAFVQAAFWjxDxQjxDxlWAAQlVAAjxjxg");
	this.shape_26.setTransform(239.7,1632.45);

	this.shape_27 = new cjs.Shape();
	this.shape_27.graphics.f("rgba(255,255,204,0.337)").s().p("ApGJHQjyjxABlWQgBlVDyjxQDyjxFUAAQFVAADyDxQDyDxgBFVQABFWjyDxQjyDxlVABQlUgBjyjxg");
	this.shape_27.setTransform(239.95,1601.8);

	this.shape_28 = new cjs.Shape();
	this.shape_28.graphics.f("rgba(255,255,204,0.337)").s().p("ApGJHQjyjyAAlVQAAlVDyjxQDyjxFUgBQFWABDxDxQDyDxAAFVQAAFVjyDyQjxDxlWAAQlUAAjyjxg");
	this.shape_28.setTransform(240.25,1571.15);

	this.shape_29 = new cjs.Shape();
	this.shape_29.graphics.f("rgba(255,255,204,0.341)").s().p("ApGJHQjxjygBlVQABlUDxjyQDxjyFVAAQFWAADxDyQDxDyAAFUQAAFVjxDyQjxDylWgBQlVABjxjyg");
	this.shape_29.setTransform(240.5,1540.45);

	this.shape_30 = new cjs.Shape();
	this.shape_30.graphics.f("rgba(255,255,204,0.341)").s().p("ApGJHQjyjyAAlVQAAlUDyjyQDxjyFVABQFVgBDyDyQDyDyAAFUQAAFVjyDyQjyDxlVAAQlVAAjxjxg");
	this.shape_30.setTransform(240.8,1509.85);

	this.shape_31 = new cjs.Shape();
	this.shape_31.graphics.f("rgba(255,255,204,0.341)").s().p("ApGJHQjxjygBlVQABlUDxjyQDxjyFVAAQFWAADxDyQDxDyAAFUQAAFVjxDyQjxDylWAAQlVAAjxjyg");
	this.shape_31.setTransform(241.05,1479.2);

	this.shape_32 = new cjs.Shape();
	this.shape_32.graphics.f("rgba(255,255,204,0.345)").s().p("ApGJHQjxjxAAlWQAAlUDxjyQDxjyFVAAQFWAADxDyQDxDxABFVQgBFWjxDxQjxDxlWAAQlVAAjxjxg");
	this.shape_32.setTransform(241.35,1448.5);

	this.shape_33 = new cjs.Shape();
	this.shape_33.graphics.f("rgba(255,255,204,0.345)").s().p("ApGJHQjyjyAAlVQAAlUDyjyQDyjyFUABQFWgBDxDyQDyDyAAFUQAAFVjyDyQjxDylWgBQlUABjyjyg");
	this.shape_33.setTransform(241.6,1417.85);

	this.shape_34 = new cjs.Shape();
	this.shape_34.graphics.f("rgba(255,255,204,0.345)").s().p("ApGJHQjxjxAAlWQAAlVDxjxQDxjyFVAAQFWAADxDyQDxDxABFVQgBFWjxDxQjxDxlWAAQlVAAjxjxg");
	this.shape_34.setTransform(241.9,1387.2);

	this.shape_35 = new cjs.Shape();
	this.shape_35.graphics.f("rgba(255,255,204,0.349)").s().p("ApGJHQjyjxAAlWQAAlVDyjxQDxjxFVAAQFVAADyDxQDyDxAAFVQAAFWjyDxQjyDxlVABQlVgBjxjxg");
	this.shape_35.setTransform(242.15,1356.55);

	this.shape_36 = new cjs.Shape();
	this.shape_36.graphics.f("rgba(255,255,204,0.349)").s().p("ApGJHQjyjyABlVQgBlVDyjxQDyjxFUgBQFVABDyDxQDyDxgBFVQABFVjyDyQjyDxlVAAQlUAAjyjxg");
	this.shape_36.setTransform(242.45,1325.9);

	this.shape_37 = new cjs.Shape();
	this.shape_37.graphics.f("rgba(255,255,204,0.353)").s().p("ApGJHQjxjxAAlWQAAlVDxjxQDxjxFVAAQFWAADxDxQDxDxABFVQgBFVjxDyQjxDxlWABQlVgBjxjxg");
	this.shape_37.setTransform(242.7,1295.25);

	this.shape_38 = new cjs.Shape();
	this.shape_38.graphics.f("rgba(255,255,204,0.353)").s().p("ApGJHQjyjyABlVQgBlUDyjyQDyjyFUABQFVgBDyDyQDyDygBFUQABFVjyDyQjyDxlVAAQlUAAjyjxg");
	this.shape_38.setTransform(243,1264.6);

	this.shape_39 = new cjs.Shape();
	this.shape_39.graphics.f("rgba(255,255,204,0.353)").s().p("ApGJHQjxjyAAlVQAAlUDxjyQDxjyFVAAQFWAADxDyQDxDyABFUQgBFVjxDyQjxDylWAAQlVAAjxjyg");
	this.shape_39.setTransform(243.25,1233.95);

	this.shape_40 = new cjs.Shape();
	this.shape_40.graphics.f("rgba(255,255,204,0.357)").s().p("ApGJHQjyjxAAlWQAAlUDyjyQDyjyFUAAQFVAADyDyQDyDxgBFVQABFWjyDxQjyDxlVAAQlUAAjyjxg");
	this.shape_40.setTransform(243.55,1203.25);

	this.shape_41 = new cjs.Shape();
	this.shape_41.graphics.f("rgba(255,255,204,0.357)").s().p("ApGJHQjyjyABlVQgBlUDyjyQDyjyFUABQFVgBDyDyQDyDygBFUQABFVjyDyQjyDylVgBQlUABjyjyg");
	this.shape_41.setTransform(243.8,1172.6);

	this.shape_42 = new cjs.Shape();
	this.shape_42.graphics.f("rgba(255,255,204,0.357)").s().p("ApGJHQjxjygBlVQABlVDxjxQDxjyFVABQFWgBDxDyQDxDxAAFVQAAFVjxDyQjxDylWgBQlVABjxjyg");
	this.shape_42.setTransform(244.1,1142);

	this.shape_43 = new cjs.Shape();
	this.shape_43.graphics.f("rgba(255,255,204,0.361)").s().p("ApGJHQjyjxABlWQgBlVDyjxQDyjxFUAAQFVAADyDxQDyDxgBFVQABFWjyDxQjyDxlVABQlUgBjyjxg");
	this.shape_43.setTransform(244.35,1111.3);

	this.shape_44 = new cjs.Shape();
	this.shape_44.graphics.f("rgba(255,255,204,0.361)").s().p("ApGJHQjxjygBlVQABlVDxjxQDxjxFVgBQFWABDxDxQDxDxAAFVQAAFVjxDyQjxDxlWAAQlVAAjxjxg");
	this.shape_44.setTransform(244.65,1080.65);

	this.shape_45 = new cjs.Shape();
	this.shape_45.graphics.f("rgba(255,255,204,0.361)").s().p("ApGJHQjyjxAAlWQAAlVDyjxQDyjxFUAAQFVAADyDxQDyDxgBFVQABFVjyDyQjyDxlVABQlUgBjyjxg");
	this.shape_45.setTransform(244.9,1050);

	this.shape_46 = new cjs.Shape();
	this.shape_46.graphics.f("rgba(255,255,204,0.365)").s().p("ApGJHQjyjyAAlVQAAlUDyjyQDyjyFUAAQFWAADxDyQDyDyAAFUQAAFVjyDyQjxDxlWAAQlUAAjyjxg");
	this.shape_46.setTransform(245.2,1019.35);

	this.shape_47 = new cjs.Shape();
	this.shape_47.graphics.f("rgba(255,255,204,0.365)").s().p("ApGJHQjxjygBlVQABlVDxjxQDxjyFVAAQFWAADxDyQDxDxAAFVQAAFVjxDyQjxDylWAAQlVAAjxjyg");
	this.shape_47.setTransform(245.45,988.7);

	this.shape_48 = new cjs.Shape();
	this.shape_48.graphics.f("rgba(255,255,204,0.365)").s().p("ApGJHQjyjyABlVQgBlUDyjyQDyjyFUABQFVgBDyDyQDyDygBFUQABFVjyDyQjyDylVgBQlUABjyjyg");
	this.shape_48.setTransform(245.7,958.05);

	this.shape_49 = new cjs.Shape();
	this.shape_49.graphics.f("rgba(255,255,204,0.369)").s().p("ApGJHQjxjygBlVQABlUDxjyQDxjyFVABQFWgBDxDyQDxDyAAFUQAAFVjxDyQjxDylWgBQlVABjxjyg");
	this.shape_49.setTransform(246,927.35);

	this.shape_50 = new cjs.Shape();
	this.shape_50.graphics.f("rgba(255,255,204,0.369)").s().p("ApGJHQjyjyABlVQgBlUDyjyQDyjyFUABQFVgBDyDyQDyDygBFUQABFVjyDyQjyDylVAAQlUAAjyjyg");
	this.shape_50.setTransform(246.25,896.75);

	this.shape_51 = new cjs.Shape();
	this.shape_51.graphics.f("rgba(255,255,204,0.373)").s().p("ApGJHQjyjxAAlWQAAlVDyjxQDyjxFUAAQFWAADxDxQDyDxAAFVQAAFWjyDxQjxDxlWABQlUgBjyjxg");
	this.shape_51.setTransform(246.55,866.05);

	this.shape_52 = new cjs.Shape();
	this.shape_52.graphics.f("rgba(255,255,204,0.373)").s().p("ApGJHQjxjxgBlWQABlVDxjxQDxjxFVgBQFWABDxDxQDxDxAAFVQAAFWjxDxQjxDxlWAAQlVAAjxjxg");
	this.shape_52.setTransform(246.8,835.4);

	this.shape_53 = new cjs.Shape();
	this.shape_53.graphics.f("rgba(255,255,204,0.373)").s().p("ApGJHQjyjxAAlWQAAlVDyjxQDxjxFVAAQFVAADyDxQDyDxAAFVQAAFWjyDxQjyDxlVABQlVgBjxjxg");
	this.shape_53.setTransform(247.1,804.75);

	this.shape_54 = new cjs.Shape();
	this.shape_54.graphics.f("rgba(255,255,204,0.376)").s().p("ApGJHQjxjygBlVQABlUDxjyQDxjyFVAAQFWAADxDyQDxDyAAFUQAAFVjxDyQjxDylWgBQlVABjxjyg");
	this.shape_54.setTransform(247.35,774.1);

	this.shape_55 = new cjs.Shape();
	this.shape_55.graphics.f("rgba(255,255,204,0.376)").s().p("ApGJHQjxjyAAlVQAAlVDxjxQDxjyFVAAQFWAADxDyQDxDxABFVQgBFVjxDyQjxDylWAAQlVAAjxjyg");
	this.shape_55.setTransform(247.65,743.45);

	this.shape_56 = new cjs.Shape();
	this.shape_56.graphics.f("rgba(255,255,204,0.376)").s().p("ApGJHQjyjyAAlVQAAlUDyjyQDyjyFUABQFWgBDxDyQDyDyAAFUQAAFVjyDyQjxDylWgBQlUABjyjyg");
	this.shape_56.setTransform(247.9,712.8);

	this.shape_57 = new cjs.Shape();
	this.shape_57.graphics.f("rgba(255,255,204,0.38)").s().p("ApGJHQjxjyAAlVQAAlUDxjyQDxjyFVABQFWgBDxDyQDxDyABFUQgBFVjxDyQjxDylWgBQlVABjxjyg");
	this.shape_57.setTransform(248.2,682.1);

	this.shape_58 = new cjs.Shape();
	this.shape_58.graphics.f("rgba(255,255,204,0.38)").s().p("ApGJHQjyjyAAlVQAAlUDyjyQDxjyFVABQFVgBDyDyQDyDyAAFUQAAFVjyDyQjyDylVAAQlVAAjxjyg");
	this.shape_58.setTransform(248.45,651.5);

	this.shape_59 = new cjs.Shape();
	this.shape_59.graphics.f("rgba(255,255,204,0.38)").s().p("ApGJHQjyjxABlWQgBlVDyjxQDyjyFUAAQFVAADyDyQDyDxgBFVQABFWjyDxQjyDxlVAAQlUAAjyjxg");
	this.shape_59.setTransform(248.75,620.85);

	this.shape_60 = new cjs.Shape();
	this.shape_60.graphics.f("rgba(255,255,204,0.384)").s().p("ApGJHQjxjxAAlWQAAlVDxjxQDxjxFVgBQFWABDxDxQDxDxABFVQgBFWjxDxQjxDxlWAAQlVAAjxjxg");
	this.shape_60.setTransform(249,590.15);

	this.shape_61 = new cjs.Shape();
	this.shape_61.graphics.f("rgba(255,255,204,0.384)").s().p("ApGJHQjyjxABlWQgBlVDyjxQDyjxFUAAQFVAADyDxQDyDxgBFVQABFWjyDxQjyDxlVABQlUgBjyjxg");
	this.shape_61.setTransform(249.3,559.5);

	this.shape_62 = new cjs.Shape();
	this.shape_62.graphics.f("rgba(255,255,204,0.384)").s().p("ApGJHQjxjyAAlVQAAlUDxjyQDxjyFVAAQFWAADxDyQDxDyABFUQgBFVjxDyQjxDylWgBQlVABjxjyg");
	this.shape_62.setTransform(249.55,528.85);

	this.shape_63 = new cjs.Shape();
	this.shape_63.graphics.f("rgba(255,255,204,0.388)").s().p("ApGJHQjyjyAAlVQAAlVDyjxQDyjyFUAAQFVAADyDyQDyDxgBFVQABFVjyDyQjyDylVAAQlUAAjyjyg");
	this.shape_63.setTransform(249.85,498.2);

	this.shape_64 = new cjs.Shape();
	this.shape_64.graphics.f("rgba(255,255,204,0.388)").s().p("ApGJHQjyjyABlVQgBlUDyjyQDyjyFUABQFVgBDyDyQDyDygBFUQABFVjyDyQjyDylVgBQlUABjyjyg");
	this.shape_64.setTransform(250.1,467.55);

	this.shape_65 = new cjs.Shape();
	this.shape_65.graphics.f("rgba(255,255,204,0.392)").s().p("ApGJHQjxjxgBlWQABlUDxjyQDxjyFVAAQFVAADyDyQDxDyAAFUQAAFWjxDxQjyDylVAAQlVAAjxjyg");
	this.shape_65.setTransform(250.4,436.9);

	this.shape_66 = new cjs.Shape();
	this.shape_66.graphics.f("rgba(255,255,204,0.392)").s().p("ApGJHQjyjyABlVQgBlUDyjyQDyjyFUABQFVgBDyDyQDyDygBFUQABFVjyDyQjyDylVgBQlUABjyjyg");
	this.shape_66.setTransform(250.65,406.25);

	this.shape_67 = new cjs.Shape();
	this.shape_67.graphics.f("rgba(255,255,204,0.392)").s().p("ApGJHQjxjxgBlWQABlVDxjxQDxjxFVgBQFWABDxDxQDxDxAAFVQAAFWjxDxQjxDxlWAAQlVAAjxjxg");
	this.shape_67.setTransform(250.95,375.6);

	this.shape_68 = new cjs.Shape();
	this.shape_68.graphics.f("rgba(255,255,204,0.396)").s().p("ApGJHQjyjyABlVQgBlVDyjxQDyjxFUgBQFVABDyDxQDyDxgBFVQABFVjyDyQjyDxlVAAQlUAAjyjxg");
	this.shape_68.setTransform(251.2,344.9);

	this.shape_69 = new cjs.Shape();
	this.shape_69.graphics.f("rgba(255,255,204,0.396)").s().p("ApGJHQjyjxAAlWQAAlVDyjxQDyjxFUAAQFWAADxDxQDyDxAAFVQAAFWjyDxQjxDxlWABQlUgBjyjxg");
	this.shape_69.setTransform(251.5,314.25);

	this.shape_70 = new cjs.Shape();
	this.shape_70.graphics.f("rgba(255,255,204,0.396)").s().p("ApGJHQjxjxgBlWQABlVDxjxQDxjxFVAAQFWAADxDxQDxDxAAFVQAAFWjxDxQjxDxlWABQlVgBjxjxg");
	this.shape_70.setTransform(251.75,283.65);

	this.shape_71 = new cjs.Shape();
	this.shape_71.graphics.f("rgba(255,255,204,0.4)").s().p("ApGJHQjyjyAAlVQAAlVDyjxQDxjyFVAAQFVAADyDyQDyDxAAFVQAAFVjyDyQjyDylVAAQlVAAjxjyg");
	this.shape_71.setTransform(252.05,252.95);

	this.shape_72 = new cjs.Shape();
	this.shape_72.graphics.f("rgba(255,255,204,0.4)").s().p("ApGJHQjxjygBlVQABlUDxjyQDxjyFVABQFWgBDxDyQDxDyAAFUQAAFVjxDyQjxDylWgBQlVABjxjyg");
	this.shape_72.setTransform(252.3,222.3);

	this.shape_73 = new cjs.Shape();
	this.shape_73.graphics.f("rgba(255,255,204,0.396)").s().p("ApGJHQjyjxABlWQgBlVDyjxQDyjxFUAAQFVAADyDxQDyDxgBFVQABFWjyDxQjyDxlVABQlUgBjyjxg");
	this.shape_73.setTransform(255.95,200.85);

	this.shape_74 = new cjs.Shape();
	this.shape_74.graphics.f("rgba(255,255,204,0.384)").s().p("ApGJHQjyjyAAlVQAAlVDyjxQDyjyFUAAQFWAADxDyQDyDxAAFVQAAFVjyDyQjxDylWAAQlUAAjyjyg");
	this.shape_74.setTransform(263.2,158);

	this.shape_75 = new cjs.Shape();
	this.shape_75.graphics.f("rgba(255,255,204,0.376)").s().p("ApGJHQjyjxABlWQgBlVDyjxQDyjxFUgBQFVABDyDxQDyDxgBFVQABFWjyDxQjyDxlVAAQlUAAjyjxg");
	this.shape_75.setTransform(266.85,136.55);

	this.shape_76 = new cjs.Shape();
	this.shape_76.graphics.f("rgba(255,255,204,0.373)").s().p("ApGJHQjyjxABlWQgBlUDyjyQDyjyFUAAQFVAADyDyQDyDygBFUQABFWjyDxQjyDylVAAQlUAAjyjyg");
	this.shape_76.setTransform(270.45,115.15);

	this.shape_77 = new cjs.Shape();
	this.shape_77.graphics.f("rgba(255,255,204,0.369)").s().p("ApGJHQjyjyAAlVQAAlUDyjyQDxjyFVAAQFVAADyDyQDyDyAAFUQAAFVjyDyQjyDylVgBQlVABjxjyg");
	this.shape_77.setTransform(274.1,93.7);

	this.shape_78 = new cjs.Shape();
	this.shape_78.graphics.f("rgba(255,255,204,0.357)").s().p("ApGJHQjyjxAAlWQAAlUDyjyQDyjyFUAAQFVAADyDyQDyDygBFUQABFWjyDxQjyDylVAAQlUAAjyjyg");
	this.shape_78.setTransform(281.35,50.8);

	this.shape_79 = new cjs.Shape();
	this.shape_79.graphics.f("rgba(255,255,204,0.349)").s().p("ApGJHQjxjxAAlWQAAlVDxjxQDxjxFVAAQFWAADxDxQDxDxABFVQgBFWjxDxQjxDxlWABQlVgBjxjxg");
	this.shape_79.setTransform(285,29.4);

	this.shape_80 = new cjs.Shape();
	this.shape_80.graphics.f("rgba(255,255,204,0.345)").s().p("ApGJHQjxjxgBlWQABlVDxjxQDxjxFVgBQFVABDyDxQDxDxAAFVQAAFWjxDxQjyDxlVAAQlVAAjxjxg");
	this.shape_80.setTransform(288.65,7.95);

	this.shape_81 = new cjs.Shape();
	this.shape_81.graphics.f("rgba(255,255,204,0.341)").s().p("ApGJHQjxjygBlVQABlVDxjxQDxjyFVAAQFWAADxDyQDxDxAAFVQAAFVjxDyQjxDylWAAQlVAAjxjyg");
	this.shape_81.setTransform(292.25,-13.45);

	this.shape_82 = new cjs.Shape();
	this.shape_82.graphics.f("rgba(255,255,204,0.333)").s().p("ApGJHQjxjxAAlWQAAlVDxjxQDxjxFVgBQFWABDxDxQDxDxABFVQgBFWjxDxQjxDxlWAAQlVAAjxjxg");
	this.shape_82.setTransform(295.9,-34.9);

	this.shape_83 = new cjs.Shape();
	this.shape_83.graphics.f("rgba(255,255,204,0.329)").s().p("ApGJHQjxjygBlVQABlUDxjyQDxjyFVABQFWgBDxDyQDxDyAAFUQAAFVjxDyQjxDylWAAQlVAAjxjyg");
	this.shape_83.setTransform(299.55,-56.35);

	this.shape_84 = new cjs.Shape();
	this.shape_84.graphics.f("rgba(255,255,204,0.322)").s().p("ApGJHQjxjygBlVQABlUDxjyQDxjyFVAAQFWAADxDyQDxDyAAFUQAAFVjxDyQjxDylWgBQlVABjxjyg");
	this.shape_84.setTransform(303.15,-77.75);

	this.shape_85 = new cjs.Shape();
	this.shape_85.graphics.f("rgba(255,255,204,0.318)").s().p("ApGJHQjyjxABlWQgBlVDyjxQDyjxFUAAQFVAADyDxQDyDxgBFVQABFWjyDxQjyDxlVABQlUgBjyjxg");
	this.shape_85.setTransform(306.8,-99.2);

	this.shape_86 = new cjs.Shape();
	this.shape_86.graphics.f("rgba(255,255,204,0.314)").s().p("ApGJHQjyjxAAlWQAAlUDyjyQDyjyFUAAQFWAADxDyQDyDyAAFUQAAFWjyDxQjxDylWAAQlUAAjyjyg");
	this.shape_86.setTransform(310.45,-120.65);

	this.shape_87 = new cjs.Shape();
	this.shape_87.graphics.f("rgba(255,255,204,0.306)").s().p("ApGJHQjyjyAAlVQAAlUDyjyQDyjyFUAAQFWAADxDyQDyDyAAFUQAAFVjyDyQjxDylWgBQlUABjyjyg");
	this.shape_87.setTransform(314.05,-142.1);

	this.shape_88 = new cjs.Shape();
	this.shape_88.graphics.f("rgba(255,255,204,0.302)").s().p("ApGJHQjyjxABlWQgBlVDyjxQDyjxFUgBQFVABDyDxQDyDxgBFVQABFWjyDxQjyDxlVAAQlUAAjyjxg");
	this.shape_88.setTransform(317.7,-163.5);

	this.shape_89 = new cjs.Shape();
	this.shape_89.graphics.f("rgba(255,255,204,0.294)").s().p("ApGJHQjyjyAAlVQAAlUDyjyQDxjyFVABQFVgBDyDyQDyDyAAFUQAAFVjyDyQjyDylVgBQlVABjxjyg");
	this.shape_89.setTransform(321.35,-184.95);

	this.shape_90 = new cjs.Shape();
	this.shape_90.graphics.f("rgba(255,255,204,0.29)").s().p("ApGJHQjyjxAAlWQAAlVDyjxQDxjxFVgBQFVABDyDxQDyDxAAFVQAAFWjyDxQjyDxlVAAQlVAAjxjxg");
	this.shape_90.setTransform(324.95,-206.35);

	this.shape_91 = new cjs.Shape();
	this.shape_91.graphics.f("rgba(255,255,204,0.286)").s().p("ApGJHQjyjyAAlVQAAlUDyjyQDyjyFUABQFVgBDyDyQDyDygBFUQABFVjyDyQjyDylVgBQlUABjyjyg");
	this.shape_91.setTransform(328.6,-227.8);

	this.shape_92 = new cjs.Shape();
	this.shape_92.graphics.f("rgba(255,255,204,0.278)").s().p("ApGJHQjxjyAAlVQAAlVDxjxQDxjyFVAAQFWAADxDyQDxDxABFVQgBFVjxDyQjxDylWAAQlVAAjxjyg");
	this.shape_92.setTransform(332.25,-249.25);

	this.shape_93 = new cjs.Shape();
	this.shape_93.graphics.f("rgba(255,255,204,0.275)").s().p("ApGJHQjxjxAAlWQAAlUDxjyQDxjxFVAAQFWAADxDxQDxDyABFUQgBFWjxDxQjxDxlWABQlVgBjxjxg");
	this.shape_93.setTransform(335.85,-270.65);

	this.shape_94 = new cjs.Shape();
	this.shape_94.graphics.f("rgba(255,255,204,0.267)").s().p("ApGJHQjxjxgBlWQABlUDxjyQDxjyFVAAQFWAADxDyQDxDyAAFUQAAFWjxDxQjxDylWAAQlVAAjxjyg");
	this.shape_94.setTransform(339.5,-292.1);

	this.shape_95 = new cjs.Shape();
	this.shape_95.graphics.f("rgba(255,255,204,0.263)").s().p("ApGJHQjxjyAAlVQAAlUDxjyQDxjyFVAAQFWAADxDyQDxDyABFUQgBFVjxDyQjxDylWgBQlVABjxjyg");
	this.shape_95.setTransform(343.15,-313.55);

	this.shape_96 = new cjs.Shape();
	this.shape_96.graphics.f("rgba(255,255,204,0.259)").s().p("ApGJHQjxjxgBlWQABlVDxjxQDxjxFVAAQFWAADxDxQDxDxAAFVQAAFWjxDxQjxDxlWABQlVgBjxjxg");
	this.shape_96.setTransform(346.8,-335);

	this.shape_97 = new cjs.Shape();
	this.shape_97.graphics.f("rgba(255,255,204,0.251)").s().p("ApGJHQjxjygBlVQABlUDxjyQDxjyFVABQFWgBDxDyQDxDyAAFUQAAFVjxDyQjxDylWgBQlVABjxjyg");
	this.shape_97.setTransform(350.4,-356.4);

	this.shape_98 = new cjs.Shape();
	this.shape_98.graphics.f("rgba(255,255,204,0.247)").s().p("ApGJHQjyjxABlWQgBlVDyjxQDyjxFUAAQFVAADyDxQDyDxgBFVQABFWjyDxQjyDxlVABQlUgBjyjxg");
	this.shape_98.setTransform(354.05,-377.85);

	this.shape_99 = new cjs.Shape();
	this.shape_99.graphics.f("rgba(255,255,204,0.239)").s().p("ApGJHQjyjyABlVQgBlUDyjyQDyjyFUABQFVgBDyDyQDyDyAAFUQAAFVjyDyQjyDylVgBQlUABjyjyg");
	this.shape_99.setTransform(357.65,-399.25);

	this.shape_100 = new cjs.Shape();
	this.shape_100.graphics.f("rgba(255,255,204,0.235)").s().p("ApGJHQjyjyAAlVQAAlVDyjxQDyjyFUAAQFWAADxDyQDyDxAAFVQAAFVjyDyQjxDylWAAQlUAAjyjyg");
	this.shape_100.setTransform(361.3,-420.7);

	this.shape_101 = new cjs.Shape();
	this.shape_101.graphics.f("rgba(255,255,204,0.231)").s().p("ApGJHQjyjxABlWQgBlVDyjxQDyjxFUgBQFVABDyDxQDyDxgBFVQABFWjyDxQjyDxlVAAQlUAAjyjxg");
	this.shape_101.setTransform(364.95,-442.15);

	this.shape_102 = new cjs.Shape();
	this.shape_102.graphics.f("rgba(255,255,204,0.224)").s().p("ApGJHQjyjyAAlVQAAlUDyjyQDxjyFVABQFVgBDyDyQDyDyAAFUQAAFVjyDyQjyDylVgBQlVABjxjyg");
	this.shape_102.setTransform(368.6,-463.6);

	this.shape_103 = new cjs.Shape();
	this.shape_103.graphics.f("rgba(255,255,204,0.22)").s().p("ApGJHQjyjyAAlVQAAlUDyjyQDxjyFVAAQFVAADyDyQDyDyAAFUQAAFVjyDyQjyDxlVAAQlVAAjxjxg");
	this.shape_103.setTransform(372.2,-485);

	this.shape_104 = new cjs.Shape();
	this.shape_104.graphics.f("rgba(255,255,204,0.212)").s().p("ApGJHQjyjyAAlVQAAlVDyjxQDyjxFUAAQFVAADyDxQDyDxgBFVQABFVjyDyQjyDxlVABQlUgBjyjxg");
	this.shape_104.setTransform(375.85,-506.45);

	this.shape_105 = new cjs.Shape();
	this.shape_105.graphics.f("rgba(255,255,204,0.208)").s().p("ApGJHQjxjxAAlWQAAlUDxjyQDxjyFVAAQFWAADxDyQDxDyABFUQgBFWjxDxQjxDylWAAQlVAAjxjyg");
	this.shape_105.setTransform(379.5,-527.9);

	this.shape_106 = new cjs.Shape();
	this.shape_106.graphics.f("rgba(255,255,204,0.204)").s().p("ApGJHQjxjxAAlWQAAlVDxjxQDxjxFVAAQFWAADxDxQDxDxABFVQgBFWjxDxQjxDxlWABQlVgBjxjxg");
	this.shape_106.setTransform(383.1,-549.3);

	this.shape_107 = new cjs.Shape();
	this.shape_107.graphics.f("rgba(255,255,204,0.196)").s().p("ApGJHQjxjxgBlWQABlVDxjxQDxjyFVAAQFWAADxDyQDxDxAAFVQAAFWjxDxQjxDxlWAAQlVAAjxjxg");
	this.shape_107.setTransform(386.75,-570.75);

	this.shape_108 = new cjs.Shape();
	this.shape_108.graphics.f("rgba(255,255,204,0.192)").s().p("ApGJHQjxjyAAlVQAAlVDxjxQDxjyFVAAQFWAADxDyQDxDxABFVQgBFVjxDyQjxDylWAAQlVAAjxjyg");
	this.shape_108.setTransform(390.4,-592.15);

	this.shape_109 = new cjs.Shape();
	this.shape_109.graphics.f("rgba(255,255,204,0.184)").s().p("ApGJHQjxjxAAlWQAAlVDxjxQDxjxFVgBQFWABDxDxQDxDxABFVQgBFWjxDxQjxDxlWAAQlVAAjxjxg");
	this.shape_109.setTransform(394,-613.6);

	this.shape_110 = new cjs.Shape();
	this.shape_110.graphics.f("rgba(255,255,204,0.18)").s().p("ApGJHQjxjygBlVQABlUDxjyQDxjyFVABQFWgBDxDyQDxDyAAFUQAAFVjxDyQjxDylWgBQlVABjxjyg");
	this.shape_110.setTransform(397.65,-635.05);

	this.shape_111 = new cjs.Shape();
	this.shape_111.graphics.f("rgba(255,255,204,0.176)").s().p("ApGJHQjyjyABlVQgBlVDyjxQDyjyFUAAQFVAADyDyQDyDxgBFVQABFVjyDyQjyDylVAAQlUAAjyjyg");
	this.shape_111.setTransform(401.3,-656.5);

	this.shape_112 = new cjs.Shape();
	this.shape_112.graphics.f("rgba(255,255,204,0.169)").s().p("ApGJHQjyjyABlVQgBlVDyjxQDyjxFUAAQFVAADyDxQDyDxAAFVQAAFVjyDyQjyDxlVABQlUgBjyjxg");
	this.shape_112.setTransform(404.9,-677.9);

	this.shape_113 = new cjs.Shape();
	this.shape_113.graphics.f("rgba(255,255,204,0.165)").s().p("ApGJHQjyjxAAlWQAAlUDyjyQDyjyFUAAQFWAADxDyQDyDyAAFUQAAFWjyDxQjxDylWAAQlUAAjyjyg");
	this.shape_113.setTransform(408.55,-699.35);

	this.shape_114 = new cjs.Shape();
	this.shape_114.graphics.f("rgba(255,255,204,0.157)").s().p("ApGJHQjyjyABlVQgBlUDyjyQDyjyFUAAQFVAADyDyQDyDygBFUQABFVjyDyQjyDxlVAAQlUAAjyjxg");
	this.shape_114.setTransform(412.2,-720.8);

	this.shape_115 = new cjs.Shape();
	this.shape_115.graphics.f("rgba(255,255,204,0.153)").s().p("ApGJHQjyjxABlWQgBlVDyjxQDyjyFUAAQFVAADyDyQDyDxgBFVQABFWjyDxQjyDxlVAAQlUAAjyjxg");
	this.shape_115.setTransform(415.8,-742.2);

	this.shape_116 = new cjs.Shape();
	this.shape_116.graphics.f("rgba(255,255,204,0.149)").s().p("ApGJHQjyjyAAlVQAAlUDyjyQDxjyFVABQFVgBDyDyQDyDyAAFUQAAFVjyDyQjyDylVgBQlVABjxjyg");
	this.shape_116.setTransform(419.45,-763.65);

	this.shape_117 = new cjs.Shape();
	this.shape_117.graphics.f("rgba(255,255,204,0.141)").s().p("ApGJHQjyjxAAlWQAAlVDyjxQDyjxFUgBQFVABDyDxQDyDxgBFVQABFWjyDxQjyDxlVAAQlUAAjyjxg");
	this.shape_117.setTransform(423.1,-785.05);

	this.shape_118 = new cjs.Shape();
	this.shape_118.graphics.f("rgba(255,255,204,0.137)").s().p("ApGJHQjyjyABlVQgBlUDyjyQDyjyFUABQFVgBDyDyQDyDygBFUQABFVjyDyQjyDylVgBQlUABjyjyg");
	this.shape_118.setTransform(426.7,-806.5);

	this.shape_119 = new cjs.Shape();
	this.shape_119.graphics.f("rgba(255,255,204,0.129)").s().p("ApGJHQjxjyAAlVQAAlVDxjxQDxjyFVAAQFWAADxDyQDxDxABFVQgBFVjxDyQjxDylWAAQlVAAjxjyg");
	this.shape_119.setTransform(430.35,-827.95);

	this.shape_120 = new cjs.Shape();
	this.shape_120.graphics.f("rgba(255,255,204,0.125)").s().p("ApGJHQjxjxgBlWQABlVDxjxQDxjxFVgBQFWABDxDxQDxDxAAFVQAAFWjxDxQjxDxlWAAQlVAAjxjxg");
	this.shape_120.setTransform(434,-849.4);

	this.shape_121 = new cjs.Shape();
	this.shape_121.graphics.f("rgba(255,255,204,0.122)").s().p("ApGJHQjxjxgBlWQABlUDxjyQDxjyFVAAQFWAADxDyQDxDyAAFUQAAFWjxDxQjxDylWAAQlVAAjxjyg");
	this.shape_121.setTransform(437.6,-870.8);

	this.shape_122 = new cjs.Shape();
	this.shape_122.graphics.f("rgba(255,255,204,0.114)").s().p("ApGJHQjxjyAAlVQAAlUDxjyQDxjyFVAAQFWAADxDyQDxDyABFUQgBFVjxDyQjxDxlWAAQlVAAjxjxg");
	this.shape_122.setTransform(441.25,-892.25);

	this.shape_123 = new cjs.Shape();
	this.shape_123.graphics.f("rgba(255,255,204,0.11)").s().p("ApGJHQjxjygBlVQABlVDxjxQDxjxFVAAQFWAADxDxQDxDxAAFVQAAFVjxDyQjxDxlWABQlVgBjxjxg");
	this.shape_123.setTransform(444.9,-913.7);

	this.shape_124 = new cjs.Shape();
	this.shape_124.graphics.f("rgba(255,255,204,0.102)").s().p("ApGJHQjxjygBlVQABlUDxjyQDxjyFVABQFWgBDxDyQDxDyAAFUQAAFVjxDyQjxDylWgBQlVABjxjyg");
	this.shape_124.setTransform(448.5,-935.1);

	this.shape_125 = new cjs.Shape();
	this.shape_125.graphics.f("rgba(255,255,204,0.098)").s().p("ApGJHQjyjxABlWQgBlVDyjxQDyjxFUAAQFVAADyDxQDyDxgBFVQABFWjyDxQjyDxlVABQlUgBjyjxg");
	this.shape_125.setTransform(452.15,-956.55);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape}]}).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_2}]},1).to({state:[{t:this.shape_3}]},1).to({state:[{t:this.shape_4}]},1).to({state:[{t:this.shape_5}]},1).to({state:[{t:this.shape_6}]},1).to({state:[{t:this.shape_7}]},1).to({state:[{t:this.shape_8}]},1).to({state:[{t:this.shape_9}]},1).to({state:[{t:this.shape_10}]},1).to({state:[{t:this.shape_11}]},1).to({state:[{t:this.shape_12}]},1).to({state:[{t:this.shape_13}]},1).to({state:[{t:this.shape_14}]},1).to({state:[{t:this.shape_15}]},1).to({state:[{t:this.shape_16,p:{x:236.7,y:1969.65}}]},1).to({state:[{t:this.shape_17}]},1).to({state:[{t:this.shape_16,p:{x:237.25,y:1908.35}}]},1).to({state:[{t:this.shape_18}]},1).to({state:[{t:this.shape_19}]},1).to({state:[{t:this.shape_20}]},1).to({state:[{t:this.shape_21}]},1).to({state:[{t:this.shape_22}]},1).to({state:[{t:this.shape_23}]},1).to({state:[{t:this.shape_24}]},1).to({state:[{t:this.shape_25}]},1).to({state:[{t:this.shape_26}]},1).to({state:[{t:this.shape_27}]},1).to({state:[{t:this.shape_28}]},1).to({state:[{t:this.shape_29}]},1).to({state:[{t:this.shape_30}]},1).to({state:[{t:this.shape_31}]},1).to({state:[{t:this.shape_32}]},1).to({state:[{t:this.shape_33}]},1).to({state:[{t:this.shape_34}]},1).to({state:[{t:this.shape_35}]},1).to({state:[{t:this.shape_36}]},1).to({state:[{t:this.shape_37}]},1).to({state:[{t:this.shape_38}]},1).to({state:[{t:this.shape_39}]},1).to({state:[{t:this.shape_40}]},1).to({state:[{t:this.shape_41}]},1).to({state:[{t:this.shape_42}]},1).to({state:[{t:this.shape_43,p:{x:244.35,y:1111.3}}]},1).to({state:[{t:this.shape_44}]},1).to({state:[{t:this.shape_45}]},1).to({state:[{t:this.shape_46}]},1).to({state:[{t:this.shape_47}]},1).to({state:[{t:this.shape_48}]},1).to({state:[{t:this.shape_49}]},1).to({state:[{t:this.shape_50}]},1).to({state:[{t:this.shape_51}]},1).to({state:[{t:this.shape_52}]},1).to({state:[{t:this.shape_53}]},1).to({state:[{t:this.shape_54}]},1).to({state:[{t:this.shape_55}]},1).to({state:[{t:this.shape_56}]},1).to({state:[{t:this.shape_57}]},1).to({state:[{t:this.shape_58}]},1).to({state:[{t:this.shape_59}]},1).to({state:[{t:this.shape_60}]},1).to({state:[{t:this.shape_61}]},1).to({state:[{t:this.shape_62}]},1).to({state:[{t:this.shape_63}]},1).to({state:[{t:this.shape_64,p:{x:250.1,y:467.55}}]},1).to({state:[{t:this.shape_65}]},1).to({state:[{t:this.shape_66}]},1).to({state:[{t:this.shape_67}]},1).to({state:[{t:this.shape_68}]},1).to({state:[{t:this.shape_69}]},1).to({state:[{t:this.shape_70}]},1).to({state:[{t:this.shape_71}]},1).to({state:[{t:this.shape_72}]},1).to({state:[{t:this.shape_73}]},1).to({state:[{t:this.shape_64,p:{x:259.55,y:179.45}}]},1).to({state:[{t:this.shape_74}]},1).to({state:[{t:this.shape_75}]},1).to({state:[{t:this.shape_76}]},1).to({state:[{t:this.shape_77}]},1).to({state:[{t:this.shape_43,p:{x:277.75,y:72.25}}]},1).to({state:[{t:this.shape_78}]},1).to({state:[{t:this.shape_79}]},1).to({state:[{t:this.shape_80}]},1).to({state:[{t:this.shape_81}]},1).to({state:[{t:this.shape_82}]},1).to({state:[{t:this.shape_83}]},1).to({state:[{t:this.shape_84}]},1).to({state:[{t:this.shape_85}]},1).to({state:[{t:this.shape_86}]},1).to({state:[{t:this.shape_87}]},1).to({state:[{t:this.shape_88}]},1).to({state:[{t:this.shape_89}]},1).to({state:[{t:this.shape_90}]},1).to({state:[{t:this.shape_91}]},1).to({state:[{t:this.shape_92}]},1).to({state:[{t:this.shape_93}]},1).to({state:[{t:this.shape_94}]},1).to({state:[{t:this.shape_95}]},1).to({state:[{t:this.shape_96}]},1).to({state:[{t:this.shape_97}]},1).to({state:[{t:this.shape_98}]},1).to({state:[{t:this.shape_99}]},1).to({state:[{t:this.shape_100}]},1).to({state:[{t:this.shape_101}]},1).to({state:[{t:this.shape_102}]},1).to({state:[{t:this.shape_103}]},1).to({state:[{t:this.shape_104}]},1).to({state:[{t:this.shape_105}]},1).to({state:[{t:this.shape_106}]},1).to({state:[{t:this.shape_107}]},1).to({state:[{t:this.shape_108}]},1).to({state:[{t:this.shape_109}]},1).to({state:[{t:this.shape_110}]},1).to({state:[{t:this.shape_111}]},1).to({state:[{t:this.shape_112}]},1).to({state:[{t:this.shape_113}]},1).to({state:[{t:this.shape_114}]},1).to({state:[{t:this.shape_115}]},1).to({state:[{t:this.shape_116}]},1).to({state:[{t:this.shape_117}]},1).to({state:[{t:this.shape_118}]},1).to({state:[{t:this.shape_119}]},1).to({state:[{t:this.shape_120}]},1).to({state:[{t:this.shape_121}]},1).to({state:[{t:this.shape_122}]},1).to({state:[{t:this.shape_123}]},1).to({state:[{t:this.shape_124}]},1).to({state:[{t:this.shape_125}]},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(149.9,-1039,384.70000000000005,3581.6);


(lib.angry_mouth_sailence = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("AIhnBQAsAPArASQG+C5mEGbQhPBThxBdQgEAEgFAEIgUAQQgOALgOALACpoSIh6G7IE9CDIFGCIACpoSQDLAWCtA7Ii1HtAjZobIhcEvIi/EXQgkgrgogyQi6jnhrihQACgBACAAQAUgFAUgEQFHhIEZgPQDRgKCxATAkBFaQhOhShOh1Qgogvgvg5As5nEIIEDYIFkCVIkwGxAGnGkQgXAWgbATQhYA+hgAQQhAAJhBgKQiggcidikAA8IaIEwnu");
	this.shape.setTransform(87.0254,54.3138);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFFFFF").s().p("AA8IaIEwnuIFGCIQhPBThxBdIgJAIIgUAQIgcAWIgSASQgXAWgbATQhYA+hgAQQgfAEgeAAQgiAAgigFgAA8IaQiggcidikIEwmxIE9CDIk9iDIlkiVIFkCVIkwGxQhOhShOh1IhXhoIC/kXIBckvQDRgKCxATIh6G7IB6m7QDLAWCtA7QAsAPArASQG+C5mEGbIlGiIIkwHuIAAAAgAFsAsIC1ntgAKyC0gApAgyQi6jnhrihIAEgBIAogJIIEDYIi/EXIhMhdgAk1jsIoEjYQFHhIEZgPIhcEvgAjZobg");
	this.shape_1.setTransform(87.0254,54.3138);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.angry_mouth_sailence, new cjs.Rectangle(-1.5,-1.5,177.1,111.7), null);


(lib.angry = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("Ae+hnQCsCMB1CkQBBm3CZl5QEuryGsE9IBlCLQBhCTAVCyQBGI6rNKcICQC0QChDeBZDUQEdKnofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QpuS/1JjFQiNAHjagjQm3hGmIjTQziqjlD8jQAiAAO2jgQAPgDAPgEAuy/jQAOgeAQghIAthOQAxhTAWgdQBxhbA9gfQBagvBagfQH3ilGwFgQBLA9BBBBQE3E2BXGPQA0DxgiCrIglDJIg9EAAUxwBQhSgChMAQAUxwBIg0DDQgwDWAOBiQBgAlBcArQAZALAYAMQCHBAB3BJQCHBSBxBdAAz5kIAQA5IBIEGQA/FMhIB3QhjCjiLAAQiMAAhkijQhTiJgOi4IHwnBIJCoLAvEmNIAMAYQAQAeAYAfQBLBjB4BEQATALATAKQBwA4CIAaQFCA9HIhtIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIB5AAQBYAdBXAiAaLuzIhkDQQhjDkAEBgAfCsMQidhqiag9Qi0hJimgFEAiggJhQg8BEg5BhQh1DEAICRAfCsMQhFBYhDBrQiEDWAQBdEAiggJhQhuhghwhLEAkVgHyQgrgthKhCEgORgp9IVzsDQjSBqn0DkIrBE8EgkMgZTQBUj1DgjsQDGjSEuAtQB9ASDUBoQBTAoBEAnQACABADACQAOAIANAHQABAAADACQAAABAAAAIgBABIAAAAIgegTAuy/jQAAABgBABQg9CCgbBKQgCAHgCAGQglBpgXBrQhPFlBMFNQAbB6AkB7IBLEAAvY/8IgBACIAnAXAvY/7QAJAFAdATA9E0AQADADAEADQA2AoBXBBIEfDVQgUA8gdA0QhQCNhuAAQhuAAhKiNQgohMAUltgEgkMgZTIHIFTA+2nZQh4g7heinQhPiLg9jWQhTkjBfkUEgxXANXQhQgOhYguQjEhpCFkxIBqiqQCKjKCcibQHanaIeCPIBVBAQCBBiCBA5QCsBKEJhkIAAgBQCEgyBihCA2Ru8IGCEvIJSoWEgTSgrhIx4uIIPDOcEgu3ANUQATAAAUAAQgBgGgBgFQgSAGgTAFQhNAShTgPQBEgDBcAAgAYiJGQgFAAgFAAQhPgGhhAIQhlgBiDALQgVACgUADQjnAYiDA9Qg5AagjAfQgKAGgKAIQghAWgkAfQhaBOgpBOQgDAGgDAFQAAABAAAAQhkDZEyCeQA0AbBAAZQAeALAfALIBuAXQBVAOBTAFQAxADAwgCQCqgDCEgqQC/hBB0iSQBjiugBinQgDkIlDgZgAXTWPIBPtJALtKsIAELPAREW7IATtk");
	this.shape.setTransform(344.461,369.0433);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.rf(["#FF99FF","#000000","#070909"],[0,1,1],62.8,39.4,0,62.8,39.4,306.5).s().p("ADOH7IkejVIiNhpIgIgGInHlSQBUj1DgjsQDGjSEtAtQB9ASDUBoQBTAoBEAnIAEADIAfATIAAAAIAnAXIgBACQg9CCgbBKIgEANQglBpgYBrQhOFkBMFNQAbB6AkB7g");
	this.shape_1.setTransform(181.3,222.6037);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.rf(["#FF99FF","#000000","#070909"],[0,1,1],-50.8,48,0,-50.8,48,295.2).s().p("AtPKzQhLlNBOllQAYhqAkhpIgHAiQgUBgAgiPQAahKA+iCIABgCIAeg/IAthOQAxhTAWgdQBwhbA9gfQBagvBagfQH4ilGwFgQBLA9BBBBIpCILInwHAIpSIWQgkh7gch6gAhxgaIANgWIAAAAIgNAWg");
	this.shape_2.setTransform(318.9243,210.0286);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.rf(["#FF99FF","#000000","#070909"],[0,1,1],0,0,0,0,0,1.3).s().p("AAGgKIABAAIgNAVIAMgVg");
	this.shape_3.setTransform(308.2,206.225);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#000000").s().p("AH4EwQhTiJgNi3IHxnCIAQA6IgQg6QAVAugBACIgEAKIBHEGQBAFLhIB3QhjCjiNAAQiMAAhkijgAviFFQgphMAUlsIAIAGIAIAGICNBnIEeDWQgTA7geA0QhQCOhtAAQhuAAhKiOg");
	this.shape_4.setTransform(259.1073,251.95);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#FFFFFF").s().p("ADeQYQiHgahvg5IgmgUQh4hFhMhiQgXgfgRgeIgLgYIhLkBIJRoUQANC3BTCIQBkCjCMAAQCNAABjijQBIh2hAlMIhHkFIAEgKQABgCgVguIJCoLQE2E2BXGQQA1DwgiCqIglDJIg+EBQg3BJhMBWQiWCshlBAQhLAvhPAcIhAAUQklBHjtAAQiFAAh0gWgAvQNDQiCg5iAhiIhVg/Qh4g7hfinQhOiLg9jXQhTkhBfkVIHHFUIgIgGQgUFsApBMQBKCNBuAAQBtAABQiNQAeg0ATg8IGDEvIBLEBQhiBBiEAzIgBAAQiYA6h5AAQhaAAhJgggAk1K1g");
	this.shape_5.setTransform(279.0331,259.9777);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#FF99FF").s().p("Ag6G7IATtjIgTNjIlThAIgErOQCDg9DngYQAUgDAUgCQCDgLBlABQBhgIBPAGIAKAAIhPNIQiEAqiqADIggABQggAAgggCgAGjm5QFDAZADEIQABCmhjCuQh0CSi/BBgAoBFHQkyieBkjYIAAgBIAGgLQAphOBahOQAkgfAhgWIAUgOQAjgfA5gaIAELOQhAgZg0gbg");
	this.shape_6.setTransform(459.594,471.4259);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#FFCCFF").s().p("EgDFAlXQiNAHjagjQm3hGmIjTQziqjlD8iQAiAAO2jgIAegHIgeAHQu2DggiAAIgCgLQgSAGgTAFQhcAAhEADQhQgOhYguQjEhpCFkxIBqiqQCKjKCcicQHanaIeCPIBVBAQCBBiCBA5QCsBKEJhkIAAgBQCEgyBihCIAMAYQAQAeAYAfQBLBjB4BEIAmAVQBwA4CIAaQFCA+HIhuIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIB5AAQBYAdBXAiQBgAlBcArIAxAXQCHBAB3BJQCHBSBxBdQCsCNB1CkQBBm4CZl5QEuryGsE9IBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QoXQWw2AAQitAAi9gcgASAqlQgVACgUADQjnAYiDA9Qg5AagjAfIgUAOQghAWgkAfQhaBOgpBOIgGALIAAABQhkDZEyCdQA0AbBAAZIA9AWIBuAXQBVAOBTAFQAxADAwgCQCqgDCEgqQC/hBB0iRQBjiugBinQgDkIlDgZIgKAAQhPgGhhAIIgXAAQhdAAh0AKg");
	this.shape_7.setTransform(344.461,496.2145);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.angry, new cjs.Rectangle(-1.5,-1.5,691.9,741.1), null);


(lib.___Camera___ = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// timeline functions:
	this.frame_0 = function() {
		this.visible = false;
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(2));

	// cameraBoundary
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("rgba(0,0,0,0)").ss(2,1,1,3,true).p("EAq+AfQMhV7AAAMAAAg+fMBV7AAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-641,-361,1282,722);


(lib.Scene_1_trears_6 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// trears_6
	this.instance = new lib.trears("synched",0);
	this.instance.setTransform(-1597.95,366.95,1,1,-105.0005,0,0,46.2,36.1);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(904).to({_off:false},0).wait(1).to({regX:48.8,regY:40.8,rotation:-105.454,x:-1597.05,y:357},0).wait(1).to({rotation:-105.929,x:-1600,y:350.85},0).wait(1).to({rotation:-106.411,x:-1603,y:344.9},0).wait(1).to({rotation:-106.9,x:-1606,y:339},0).wait(1).to({rotation:-107.397,x:-1609,y:333.25},0).wait(1).to({rotation:-107.902,x:-1612.05,y:327.5},0).wait(1).to({rotation:-108.415,x:-1615.1,y:321.95},0).wait(1).to({rotation:-108.935,x:-1618.15,y:316.45},0).wait(1).to({rotation:-109.464,x:-1621.2,y:311.05},0).wait(1).to({rotation:-110.001,x:-1624.25,y:305.75},0).wait(1).to({rotation:-110.547,x:-1627.4,y:300.55},0).wait(1).to({rotation:-111.102,x:-1630.45,y:295.4},0).wait(1).to({rotation:-111.665,x:-1633.6,y:290.4},0).wait(1).to({rotation:-112.237,x:-1636.7,y:285.5},0).wait(1).to({rotation:-112.818,x:-1639.85,y:280.65},0).wait(1).to({rotation:-113.408,x:-1643,y:275.85},0).wait(1).to({rotation:-114.008,x:-1646.2,y:271.2},0).wait(1).to({rotation:-114.617,x:-1649.35,y:266.65},0).wait(1).to({rotation:-115.236,x:-1652.55,y:262.1},0).wait(1).to({rotation:-115.864,x:-1655.8,y:257.7},0).wait(1).to({rotation:-116.503,x:-1659,y:253.4},0).wait(1).to({rotation:-117.151,x:-1662.2,y:249.15},0).wait(1).to({rotation:-117.809,x:-1665.45,y:244.95},0).wait(1).to({rotation:-118.478,x:-1668.7,y:240.9},0).wait(1).to({rotation:-119.156,x:-1671.95,y:236.85},0).wait(1).to({rotation:-119.845,x:-1675.3,y:232.95},0).wait(1).to({rotation:-120.545,x:-1678.6,y:229.05},0).wait(1).to({rotation:-121.255,x:-1681.9,y:225.35},0).wait(1).to({rotation:-121.976,x:-1685.25,y:221.65},0).wait(1).to({rotation:-122.707,x:-1688.55,y:218.05},0).wait(1).to({rotation:-123.449,x:-1691.95,y:214.5},0).wait(1).to({rotation:-124.201,x:-1695.35,y:211.05},0).wait(1).to({rotation:-124.964,x:-1698.7,y:207.65},0).wait(1).to({rotation:-125.738,x:-1702.15,y:204.35},0).wait(1).to({rotation:-126.523,x:-1705.6,y:201.15},0).wait(1).to({rotation:-127.318,x:-1709.05,y:197.95},0).wait(1).to({rotation:-128.123,x:-1712.5,y:194.85},0).wait(1).to({rotation:-128.94,x:-1715.9,y:191.9},0).wait(1).to({rotation:-129.766,x:-1719.45,y:188.95},0).wait(1).to({rotation:-130.603,x:-1722.9,y:186.1},0).wait(1).to({rotation:-131.451,x:-1726.45,y:183.3},0).wait(1).to({rotation:-132.308,x:-1730.05,y:180.6},0).wait(1).to({rotation:-133.175,x:-1733.6,y:177.95},0).wait(1).to({rotation:-134.052,x:-1737.2,y:175.4},0).wait(1).to({rotation:-134.938,x:-1740.7,y:172.85},0).wait(1).to({rotation:-135.834,x:-1744.3,y:170.45},0).wait(1).to({rotation:-136.739,x:-1747.95,y:168.05},0).wait(1).to({rotation:-137.652,x:-1751.55,y:165.8},0).wait(1).to({rotation:-138.574,x:-1755.25,y:163.55},0).wait(1).to({rotation:-139.504,x:-1758.9,y:161.35},0).wait(1).to({rotation:-140.442,x:-1762.55,y:159.3},0).wait(1).to({rotation:-141.388,x:-1766.35,y:157.3},0).wait(1).to({rotation:-142.34,x:-1770.05,y:155.4},0).wait(1).to({rotation:-143.3,x:-1773.8,y:153.55},0).wait(1).to({rotation:-144.265,x:-1777.5,y:151.75},0).wait(1).to({rotation:-145.236,x:-1781.35,y:150.05},0).wait(1).to({rotation:-146.213,x:-1785.1,y:148.35},0).wait(1).to({rotation:-147.195,x:-1788.9,y:146.7},0).wait(1).to({rotation:-148.18,x:-1792.75,y:145.2},0).wait(1).to({rotation:-149.17,x:-1796.65,y:143.75},0).wait(1).to({rotation:-150.163,x:-1800.5,y:142.35},0).wait(1).to({rotation:-151.159,x:-1804.35,y:141.05},0).wait(1).to({rotation:-152.158,x:-1808.3,y:139.8},0).wait(1).to({rotation:-153.158,x:-1812.25,y:138.65},0).wait(1).to({rotation:-154.159,x:-1816.15,y:137.6},0).wait(1).to({rotation:-155.161,x:-1820.15,y:136.55},0).wait(1).to({rotation:-156.163,x:-1824.1,y:135.6},0).wait(1).to({rotation:-157.164,x:-1828.1,y:134.65},0).wait(1).to({rotation:-158.165,x:-1832.15,y:133.85},0).wait(1).to({rotation:-159.164,x:-1836.2,y:133.05},0).wait(1).to({rotation:-160.16,x:-1840.25,y:132.35},0).wait(1).to({rotation:-161.154,x:-1844.35,y:131.75},0).wait(1).to({rotation:-162.145,x:-1848.45,y:131.2},0).wait(1).to({rotation:-163.132,x:-1852.55,y:130.7},0).wait(1).to({rotation:-164.115,x:-1856.75,y:130.3},0).wait(1).to({rotation:-165.093,x:-1860.85,y:129.9},0).wait(1).to({rotation:-166.066,x:-1865.1,y:129.65},0).wait(1).to({rotation:-167.033,x:-1869.3,y:129.45},0).wait(1).to({rotation:-167.994,x:-1873.5,y:129.35},0).wait(1).to({rotation:-168.949,x:-1877.8,y:129.25},0).wait(1).to({rotation:-169.896,x:-1882.05,y:129.3},0).wait(1).to({rotation:-170.837,x:-1886.35,y:129.35},0).wait(1).to({rotation:-171.769,x:-1890.65,y:129.45},0).wait(1).to({rotation:-172.694,x:-1895,y:129.75},0).wait(1).to({rotation:-173.61,x:-1899.35,y:129.95},0).wait(1).to({rotation:-174.517,x:-1903.8,y:130.4},0).wait(1).to({rotation:-175.416,x:-1908.2,y:130.8},0).wait(1).to({rotation:-176.305,x:-1912.6,y:131.3},0).wait(1).to({rotation:-177.185,x:-1917.1,y:131.85},0).wait(1).to({rotation:-178.055,x:-1921.5,y:132.5},0).wait(1).to({rotation:-178.916,x:-1926.1,y:133.25},0).wait(1).to({rotation:-179.766,x:-1930.65,y:134},0).wait(1).to({rotation:-180.607,x:-1935.2,y:134.85},0).wait(1).to({rotation:-181.437,x:-1939.75,y:135.8},0).wait(1).to({rotation:-182.257,x:-1944.35,y:136.85},0).wait(1).to({rotation:-183.066,x:-1949.05,y:137.9},0).wait(1).to({rotation:-183.865,x:-1953.7,y:139.1},0).wait(1).to({rotation:-184.653,x:-1958.4,y:140.35},0).wait(1).to({rotation:-185.431,x:-1963.15,y:141.65},0).wait(1).to({rotation:-186.198,x:-1967.85,y:143.05},0).wait(1).to({rotation:-186.955,x:-1972.7,y:144.5},0).wait(1).to({rotation:-187.701,x:-1977.45,y:146.1},0).wait(1).to({rotation:-188.436,x:-1982.35,y:147.7},0).wait(1).to({rotation:-189.161,x:-1987.25,y:149.4},0).wait(1).to({rotation:-189.875,x:-1992.15,y:151.2},0).wait(1).to({rotation:-190.579,x:-1997.05,y:153.1},0).wait(1).to({rotation:-191.273,x:-2002.05,y:155.05},0).wait(1).to({rotation:-191.956,x:-2007.05,y:157.05},0).wait(1).to({rotation:-192.629,x:-2012.05,y:159.2},0).wait(1).to({rotation:-193.292,x:-2017.2,y:161.35},0).wait(1).to({rotation:-193.945,x:-2022.3,y:163.65},0).wait(1).to({rotation:-194.588,x:-2027.5,y:166.05},0).wait(1).to({rotation:-195.222,x:-2032.65,y:168.5},0).wait(1).to({rotation:-195.845,x:-2037.85,y:171},0).wait(1).to({rotation:-196.46,x:-2043.1,y:173.7},0).wait(1).to({rotation:-197.064,x:-2048.4,y:176.4},0).wait(1).to({rotation:-197.66,x:-2053.8,y:179.2},0).wait(1).to({rotation:-198.246,x:-2059.15,y:182.15},0).wait(1).to({rotation:-198.824,x:-2064.55,y:185.15},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_trears_5 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// trears_5
	this.instance = new lib.trears("synched",0);
	this.instance.setTransform(-1228.75,362,1,1,0,0,0,48.8,40.8);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(908).to({_off:false},0).wait(1).to({rotation:1.0004,x:-1225.4,y:354.75},0).wait(1).to({rotation:2.0329,x:-1222.05,y:347.65},0).wait(1).to({rotation:3.0663,x:-1218.5,y:340.75},0).wait(1).to({rotation:4.1003,x:-1214.95,y:334},0).wait(1).to({rotation:5.1344,x:-1211.3,y:327.35},0).wait(1).to({rotation:6.1684,x:-1207.65,y:320.85},0).wait(1).to({rotation:7.2019,x:-1203.8,y:314.55},0).wait(1).to({rotation:8.2347,x:-1200,y:308.35},0).wait(1).to({rotation:9.2663,x:-1196.05,y:302.25},0).wait(1).to({rotation:10.2964,x:-1192.1,y:296.35},0).wait(1).to({rotation:11.3248,x:-1188,y:290.6},0).wait(1).to({rotation:12.3511,x:-1183.95,y:284.9},0).wait(1).to({rotation:13.3751,x:-1179.75,y:279.4},0).wait(1).to({rotation:14.3964,x:-1175.55,y:274},0).wait(1).to({rotation:15.4148,x:-1171.25,y:268.7},0).wait(1).to({rotation:16.4301,x:-1166.95,y:263.6},0).wait(1).to({rotation:17.4419,x:-1162.55,y:258.55},0).wait(1).to({rotation:18.45,x:-1158.05,y:253.65},0).wait(1).to({rotation:19.4542,x:-1153.65,y:248.8},0).wait(1).to({rotation:20.4543,x:-1149.1,y:244.2},0).wait(1).to({rotation:21.4501,x:-1144.5,y:239.6},0).wait(1).to({rotation:22.4413,x:-1139.85,y:235.2},0).wait(1).to({rotation:23.4279,x:-1135.15,y:230.85},0).wait(1).to({rotation:24.4097,x:-1130.5,y:226.6},0).wait(1).to({rotation:25.3865,x:-1125.75,y:222.45},0).wait(1).to({rotation:26.3582,x:-1120.95,y:218.45},0).wait(1).to({rotation:27.3247,x:-1116.2,y:214.6},0).wait(1).to({rotation:28.2858,x:-1111.35,y:210.8},0).wait(1).to({rotation:29.2416,x:-1106.45,y:207.1},0).wait(1).to({rotation:30.1919,x:-1101.5,y:203.5},0).wait(1).to({rotation:31.1367,x:-1096.6,y:200},0).wait(1).to({rotation:32.076,x:-1091.6,y:196.6},0).wait(1).to({rotation:33.0097,x:-1086.65,y:193.35},0).wait(1).to({rotation:33.9378,x:-1081.55,y:190.15},0).wait(1).to({rotation:34.8603,x:-1076.45,y:187.1},0).wait(1).to({rotation:35.7773,x:-1071.4,y:184.1},0).wait(1).to({rotation:36.6887,x:-1066.3,y:181.15},0).wait(1).to({rotation:37.5946,x:-1061.2,y:178.35},0).wait(1).to({rotation:38.4951,x:-1056,y:175.65},0).wait(1).to({rotation:39.3902,x:-1050.9,y:173},0).wait(1).to({rotation:40.2801,x:-1045.65,y:170.5},0).wait(1).to({rotation:41.1647,x:-1040.45,y:168},0).wait(1).to({rotation:42.0443,x:-1035.2,y:165.7},0).wait(1).to({rotation:42.9189,x:-1030,y:163.45},0).wait(1).to({rotation:43.7886,x:-1024.75,y:161.25},0).wait(1).to({rotation:44.6536,x:-1019.45,y:159.15},0).wait(1).to({rotation:45.5141,x:-1014.15,y:157.15},0).wait(1).to({rotation:46.3701,x:-1008.95,y:155.2},0).wait(1).to({rotation:47.2219,x:-1003.6,y:153.4},0).wait(1).to({rotation:48.0696,x:-998.3,y:151.65},0).wait(1).to({rotation:48.9135,x:-993,y:150},0).wait(1).to({rotation:49.7536,x:-987.65,y:148.4},0).wait(1).to({rotation:50.5902,x:-982.25,y:146.95},0).wait(1).to({rotation:51.4236,x:-976.95,y:145.55},0).wait(1).to({rotation:52.2539,x:-971.65,y:144.2},0).wait(1).to({rotation:53.0814,x:-966.3,y:142.9},0).wait(1).to({rotation:53.9062,x:-960.95,y:141.8},0).wait(1).to({rotation:54.7287,x:-955.55,y:140.7},0).wait(1).to({rotation:55.5491,x:-950.25,y:139.7},0).wait(1).to({rotation:56.3677,x:-944.9,y:138.75},0).wait(1).to({rotation:57.1847,x:-939.6,y:137.85},0).wait(1).to({rotation:58.0004,x:-934.25,y:137.1},0).wait(1).to({rotation:58.8151,x:-928.95,y:136.45},0).wait(1).to({rotation:59.629,x:-923.6,y:135.8},0).wait(1).to({rotation:60.4426,x:-918.3,y:135.3},0).wait(1).to({rotation:61.2561,x:-912.95,y:134.8},0).wait(1).to({rotation:62.0698,x:-907.65,y:134.4},0).wait(1).to({rotation:62.884,x:-902.35,y:134.1},0).wait(1).to({rotation:63.6992,x:-897.15,y:133.9},0).wait(1).to({rotation:64.5156,x:-891.85,y:133.7},0).wait(1).to({rotation:65.3336,x:-886.6,y:133.65},0).wait(1).to({rotation:66.1536,x:-881.3,y:133.6},0).wait(1).to({rotation:66.9759,x:-876.1,y:133.65},0).wait(1).to({rotation:67.801,x:-870.9,y:133.8},0).wait(1).to({rotation:68.6293,x:-865.7,y:134},0).wait(1).to({rotation:69.4611,x:-860.55,y:134.3},0).wait(1).to({rotation:70.2969,x:-855.35,y:134.7},0).wait(1).to({rotation:71.1372,x:-850.2,y:135.15},0).wait(1).to({rotation:71.9823,x:-845.15,y:135.6},0).wait(1).to({rotation:72.8328,x:-840.1,y:136.25},0).wait(1).to({rotation:73.6892,x:-835,y:136.85},0).wait(1).to({rotation:74.5519,x:-830,y:137.6},0).wait(1).to({rotation:75.4214,x:-824.95,y:138.4},0).wait(1).to({rotation:76.2983,x:-820,y:139.25},0).wait(1).to({rotation:77.1831,x:-815,y:140.25},0).wait(1).to({rotation:78.0764,x:-810.1,y:141.3},0).wait(1).to({rotation:78.9788,x:-805.2,y:142.35},0).wait(1).to({rotation:79.8908,x:-800.4,y:143.55},0).wait(1).to({rotation:80.8132,x:-795.55,y:144.75},0).wait(1).to({rotation:81.7464,x:-790.8,y:146.1},0).wait(1).to({rotation:82.6911,x:-786.05,y:147.5},0).wait(1).to({rotation:83.6482,x:-781.35,y:148.95},0).wait(1).to({rotation:84.6181,x:-776.65,y:150.55},0).wait(1).to({rotation:85.6017,x:-772.05,y:152.15},0).wait(1).to({rotation:86.5997,x:-767.5,y:153.75},0).wait(1).to({rotation:87.6128,x:-762.9,y:155.55},0).wait(1).to({rotation:88.6418,x:-758.5,y:157.4},0).wait(1).to({rotation:89.6875,x:-754.05,y:159.3},0).wait(1).to({rotation:90.7507,x:-749.65,y:161.3},0).wait(1).to({rotation:91.8323,x:-745.3,y:163.35},0).wait(1).to({rotation:92.9331,x:-741.05,y:165.5},0).wait(1).to({rotation:94.054,x:-736.8,y:167.75},0).wait(1).to({rotation:95.1958,x:-732.65,y:170},0).wait(1).to({rotation:96.3595,x:-728.55,y:172.4},0).wait(1).to({rotation:97.5459,x:-724.5,y:174.85},0).wait(1).to({rotation:98.7559,x:-720.5,y:177.35},0).wait(1).to({rotation:99.9906,x:-716.6,y:179.9},0).wait(1).to({rotation:101.251,x:-712.7,y:182.6},0).wait(1).to({rotation:102.537,x:-708.95,y:185.4},0).wait(1).to({rotation:103.851,x:-705.25,y:188.25},0).wait(1).to({rotation:105.192,x:-701.6,y:191.1},0).wait(1).to({rotation:106.563,x:-698,y:194.05},0).wait(1).to({rotation:107.963,x:-694.55,y:197.15},0).wait(1).to({rotation:109.394,x:-691.15,y:200.35},0).wait(1).to({rotation:110.856,x:-687.8,y:203.55},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_trears_4 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// trears_4
	this.instance = new lib.trears("synched",0);
	this.instance.setTransform(-1228.75,362,1,1,0,0,0,48.8,40.8);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(918).to({_off:false},0).wait(1).to({rotation:0.411,x:-1222.9,y:356.55},0).wait(1).to({rotation:0.8417,x:-1217.1,y:351.2},0).wait(1).to({rotation:1.2795,x:-1211.35,y:346.05},0).wait(1).to({rotation:1.7247,x:-1205.7,y:341},0).wait(1).to({rotation:2.1775,x:-1200.1,y:336},0).wait(1).to({rotation:2.6381,x:-1194.5,y:331.2},0).wait(1).to({rotation:3.1066,x:-1188.9,y:326.55},0).wait(1).to({rotation:3.5833,x:-1183.45,y:321.9},0).wait(1).to({rotation:4.0685,x:-1177.95,y:317.45},0).wait(1).to({rotation:4.5622,x:-1172.55,y:313.1},0).wait(1).to({rotation:5.0647,x:-1167.2,y:308.85},0).wait(1).to({rotation:5.5763,x:-1161.85,y:304.7},0).wait(1).to({rotation:6.0971,x:-1156.6,y:300.65},0).wait(1).to({rotation:6.6274,x:-1151.3,y:296.75},0).wait(1).to({rotation:7.1674,x:-1146.1,y:292.9},0).wait(1).to({rotation:7.7173,x:-1140.95,y:289.15},0).wait(1).to({rotation:8.2774,x:-1135.7,y:285.45},0).wait(1).to({rotation:8.8478,x:-1130.7,y:281.95},0).wait(1).to({rotation:9.429,x:-1125.55,y:278.55},0).wait(1).to({rotation:10.0209,x:-1120.5,y:275.25},0).wait(1).to({rotation:10.624,x:-1115.5,y:272},0).wait(1).to({rotation:11.2384,x:-1110.55,y:268.8},0).wait(1).to({rotation:11.8643,x:-1105.6,y:265.8},0).wait(1).to({rotation:12.5021,x:-1100.65,y:262.85},0).wait(1).to({rotation:13.1519,x:-1095.8,y:260},0).wait(1).to({rotation:13.814,x:-1090.9,y:257.15},0).wait(1).to({rotation:14.4886,x:-1086.05,y:254.5},0).wait(1).to({rotation:15.176,x:-1081.3,y:251.9},0).wait(1).to({rotation:15.8762,x:-1076.5,y:249.4},0).wait(1).to({rotation:16.5897,x:-1071.75,y:247},0).wait(1).to({rotation:17.3165,x:-1067.05,y:244.65},0).wait(1).to({rotation:18.0569,x:-1062.35,y:242.45},0).wait(1).to({rotation:18.8111,x:-1057.65,y:240.25},0).wait(1).to({rotation:19.5792,x:-1053,y:238.2},0).wait(1).to({rotation:20.3614,x:-1048.4,y:236.25},0).wait(1).to({rotation:21.1579,x:-1043.85,y:234.3},0).wait(1).to({rotation:21.9689,x:-1039.25,y:232.55},0).wait(1).to({rotation:22.7944,x:-1034.7,y:230.8},0).wait(1).to({rotation:23.6346,x:-1030.15,y:229.15},0).wait(1).to({rotation:24.4895,x:-1025.65,y:227.65},0).wait(1).to({rotation:25.3592,x:-1021.15,y:226.1},0).wait(1).to({rotation:26.2439,x:-1016.75,y:224.75},0).wait(1).to({rotation:27.1434,x:-1012.25,y:223.4},0).wait(1).to({rotation:28.0578,x:-1007.9,y:222.15},0).wait(1).to({rotation:28.987,x:-1003.45,y:221.05},0).wait(1).to({rotation:29.9311,x:-999.1,y:219.95},0).wait(1).to({rotation:30.8898,x:-994.75,y:218.95},0).wait(1).to({rotation:31.8631,x:-990.45,y:218.05},0).wait(1).to({rotation:32.8508,x:-986.1,y:217.2},0).wait(1).to({rotation:33.8527,x:-981.8,y:216.5},0).wait(1).to({rotation:34.8686,x:-977.5,y:215.8},0).wait(1).to({rotation:35.8981,x:-973.2,y:215.25},0).wait(1).to({rotation:36.9411,x:-969,y:214.75},0).wait(1).to({rotation:37.9969,x:-964.8,y:214.3},0).wait(1).to({rotation:39.0654,x:-960.55,y:214},0).wait(1).to({rotation:40.1461,x:-956.4,y:213.7},0).wait(1).to({rotation:41.2383,x:-952.2,y:213.55},0).wait(1).to({rotation:42.3417,x:-948.1,y:213.4},0).wait(1).to({rotation:43.4557,x:-943.95},0).wait(1).to({rotation:44.5795,x:-939.8,y:213.45},0).wait(1).to({rotation:45.7126,x:-935.7,y:213.65},0).wait(1).to({rotation:46.8543,x:-931.6,y:213.85},0).wait(1).to({rotation:48.0039,x:-927.45,y:214.1},0).wait(1).to({rotation:49.1605,x:-923.4,y:214.5},0).wait(1).to({rotation:50.3234,x:-919.4,y:215},0).wait(1).to({rotation:51.4917,x:-915.35,y:215.55},0).wait(1).to({rotation:52.6647,x:-911.3,y:216.15},0).wait(1).to({rotation:53.8414,x:-907.3,y:216.85},0).wait(1).to({rotation:55.021,x:-903.3,y:217.7},0).wait(1).to({rotation:56.2025,x:-899.3,y:218.55},0).wait(1).to({rotation:57.3851,x:-895.3,y:219.5},0).wait(1).to({rotation:58.5678,x:-891.35,y:220.6},0).wait(1).to({rotation:59.7498,x:-887.4,y:221.7},0).wait(1).to({rotation:60.93,x:-883.5,y:222.9},0).wait(1).to({rotation:62.1077,x:-879.55,y:224.25},0).wait(1).to({rotation:63.282,x:-875.65,y:225.6},0).wait(1).to({rotation:64.4519,x:-871.75,y:227.1},0).wait(1).to({rotation:65.6166,x:-867.85,y:228.65},0).wait(1).to({rotation:66.7753,x:-864,y:230.3},0).wait(1).to({rotation:67.9273,x:-860.1,y:232},0).wait(1).to({rotation:69.0717,x:-856.2,y:233.85},0).wait(1).to({rotation:70.2078,x:-852.45,y:235.75},0).wait(1).to({rotation:71.3349,x:-848.55,y:237.8},0).wait(1).to({rotation:72.4525,x:-844.75,y:239.9},0).wait(1).to({rotation:73.5598,x:-840.95,y:242.05},0).wait(1).to({rotation:74.6562,x:-837.1,y:244.35},0).wait(1).to({rotation:75.7414,x:-833.3,y:246.75},0).wait(1).to({rotation:76.8147,x:-829.45,y:249.2},0).wait(1).to({rotation:77.8758,x:-825.7,y:251.75},0).wait(1).to({rotation:78.9241,x:-821.95,y:254.45},0).wait(1).to({rotation:79.9595,x:-818.15,y:257.2},0).wait(1).to({rotation:80.9815,x:-814.4,y:260.1},0).wait(1).to({rotation:81.9899,x:-810.6,y:263.05},0).wait(1).to({rotation:82.9845,x:-806.9,y:266.15},0).wait(1).to({rotation:83.965,x:-803.1,y:269.35},0).wait(1).to({rotation:84.9313,x:-799.4,y:272.55},0).wait(1).to({rotation:85.8833,x:-795.65,y:275.95},0).wait(1).to({rotation:86.8209,x:-791.95,y:279.4},0).wait(1).to({rotation:87.744,x:-788.2,y:283.05},0).wait(1).to({rotation:88.6526,x:-784.5,y:286.8},0).wait(1).to({rotation:89.5467,x:-780.75,y:290.6},0).wait(1).to({rotation:90.4264,x:-777.05,y:294.55},0).wait(1).to({rotation:91.2917,x:-773.4,y:298.65},0).wait(1).to({rotation:92.1426,x:-769.6,y:302.8},0).wait(1).to({rotation:92.9794,x:-766,y:307.15},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_trears_3 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// trears_3
	this.instance = new lib.trears("synched",0);
	this.instance.setTransform(-1598.1,366.75,1,1,-105.0005,0,0,45.6,34.8);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(902).to({_off:false},0).wait(1).to({regX:48.8,regY:40.8,rotation:-105.432,x:-1595.4,y:357.25},0).wait(1).to({rotation:-105.887,x:-1597.75,y:352.5},0).wait(1).to({rotation:-106.354,x:-1600.1,y:347.85},0).wait(1).to({rotation:-106.833,x:-1602.45,y:343.35},0).wait(1).to({rotation:-107.326,x:-1604.75,y:338.85},0).wait(1).to({rotation:-107.831,x:-1607.05,y:334.5},0).wait(1).to({rotation:-108.35,x:-1609.4,y:330.3},0).wait(1).to({rotation:-108.884,x:-1611.7,y:326.15},0).wait(1).to({rotation:-109.432,x:-1614.05,y:322.1},0).wait(1).to({rotation:-109.996,x:-1616.3,y:318.15},0).wait(1).to({rotation:-110.575,x:-1618.6,y:314.25},0).wait(1).to({rotation:-111.172,x:-1620.9,y:310.45},0).wait(1).to({rotation:-111.785,x:-1623.2,y:306.8},0).wait(1).to({rotation:-112.416,x:-1625.55,y:303.2},0).wait(1).to({rotation:-113.066,x:-1627.85,y:299.7},0).wait(1).to({rotation:-113.735,x:-1630.2,y:296.35},0).wait(1).to({rotation:-114.425,x:-1632.5,y:292.95},0).wait(1).to({rotation:-115.134,x:-1634.8,y:289.65},0).wait(1).to({rotation:-115.866,x:-1637.15,y:286.55},0).wait(1).to({rotation:-116.619,x:-1639.45,y:283.45},0).wait(1).to({rotation:-117.396,x:-1641.75,y:280.5},0).wait(1).to({rotation:-118.197,x:-1644.05,y:277.6},0).wait(1).to({rotation:-119.022,x:-1646.3,y:274.8},0).wait(1).to({rotation:-119.873,x:-1648.65,y:272.05},0).wait(1).to({rotation:-120.751,x:-1651,y:269.4},0).wait(1).to({rotation:-121.656,x:-1653.3,y:266.8},0).wait(1).to({rotation:-122.59,x:-1655.65,y:264.3},0).wait(1).to({rotation:-123.552,x:-1657.95,y:261.9},0).wait(1).to({rotation:-124.545,x:-1660.3,y:259.55},0).wait(1).to({rotation:-125.568,x:-1662.65,y:257.3},0).wait(1).to({rotation:-126.624,x:-1665,y:255.15},0).wait(1).to({rotation:-127.711,x:-1667.35,y:253.05},0).wait(1).to({rotation:-128.833,x:-1669.7,y:251},0).wait(1).to({rotation:-129.988,x:-1672.05,y:249.1},0).wait(1).to({rotation:-131.178,x:-1674.45,y:247.2},0).wait(1).to({rotation:-132.404,x:-1676.75,y:245.45},0).wait(1).to({rotation:-133.665,x:-1679.2,y:243.75},0).wait(1).to({rotation:-134.963,x:-1681.6,y:242.05},0).wait(1).to({rotation:-136.297,x:-1683.95,y:240.55},0).wait(1).to({rotation:-137.667,x:-1686.3,y:239.1},0).wait(1).to({rotation:-139.075,x:-1688.7,y:237.65},0).wait(1).to({rotation:-140.518,x:-1691.1,y:236.3},0).wait(1).to({rotation:-141.998,x:-1693.55,y:235.1},0).wait(1).to({rotation:-143.513,x:-1696,y:233.95},0).wait(1).to({rotation:-145.063,x:-1698.4,y:232.85},0).wait(1).to({rotation:-146.646,x:-1700.75,y:231.8},0).wait(1).to({rotation:-148.261,x:-1703.25,y:230.95},0).wait(1).to({rotation:-149.907,x:-1705.65,y:230.1},0).wait(1).to({rotation:-151.582,x:-1708.1,y:229.3},0).wait(1).to({rotation:-153.284,x:-1710.55,y:228.6},0).wait(1).to({rotation:-155.009,x:-1713.05,y:228},0).wait(1).to({rotation:-156.757,x:-1715.5,y:227.45},0).wait(1).to({rotation:-158.524,x:-1717.9,y:227.05},0).wait(1).to({rotation:-160.307,x:-1720.4,y:226.65},0).wait(1).to({rotation:-162.102,x:-1722.9,y:226.35},0).wait(1).to({rotation:-163.907,x:-1725.35,y:226.1},0).wait(1).to({rotation:-165.718,x:-1727.85,y:225.95},0).wait(1).to({rotation:-167.532,x:-1730.3,y:225.85},0).wait(1).to({rotation:-169.344,x:-1732.75,y:225.95},0).wait(1).to({rotation:-171.153,x:-1735.25,y:226},0).wait(1).to({rotation:-172.953,x:-1737.75,y:226.15},0).wait(1).to({rotation:-174.741,x:-1740.2,y:226.4},0).wait(1).to({rotation:-176.515,x:-1742.65,y:226.8},0).wait(1).to({rotation:-178.272,x:-1745.15,y:227.15},0).wait(1).to({rotation:-180.007,x:-1747.6,y:227.6},0).wait(1).to({rotation:-181.72,x:-1750.1,y:228.15},0).wait(1).to({rotation:-183.407,x:-1752.55,y:228.8},0).wait(1).to({rotation:-185.065,x:-1755,y:229.5},0).wait(1).to({rotation:-186.694,x:-1757.45,y:230.35},0).wait(1).to({rotation:-188.291,x:-1760,y:231.2},0).wait(1).to({rotation:-189.856,x:-1762.45,y:232.05},0).wait(1).to({rotation:-191.386,x:-1764.9,y:233.1},0).wait(1).to({rotation:-192.881,x:-1767.3,y:234.2},0).wait(1).to({rotation:-194.34,x:-1769.8,y:235.3},0).wait(1).to({rotation:-195.763,x:-1772.25,y:236.55},0).wait(1).to({rotation:-197.15,x:-1774.75,y:237.85},0).wait(1).to({rotation:-198.5,x:-1777.2,y:239.2},0).wait(1).to({rotation:-199.813,x:-1779.6,y:240.65},0).wait(1).to({rotation:-201.09,x:-1782.1,y:242.15},0).wait(1).to({rotation:-202.331,x:-1784.5,y:243.75},0).wait(1).to({rotation:-203.536,x:-1787,y:245.45},0).wait(1).to({rotation:-204.706,x:-1789.45,y:247.15},0).wait(1).to({rotation:-205.842,x:-1791.85,y:248.95},0).wait(1).to({rotation:-206.944,x:-1794.35,y:250.85},0).wait(1).to({rotation:-208.013,x:-1796.8,y:252.8},0).wait(1).to({rotation:-209.05,x:-1799.2,y:254.85},0).wait(1).to({rotation:-210.056,x:-1801.75,y:256.95},0).wait(1).to({rotation:-211.031,x:-1804.15,y:259.1},0).wait(1).to({rotation:-211.977,x:-1806.65,y:261.4},0).wait(1).to({rotation:-212.894,x:-1809.15,y:263.7},0).wait(1).to({rotation:-213.783,x:-1811.6,y:266.15},0).wait(1).to({rotation:-214.645,x:-1814.1,y:268.65},0).wait(1).to({rotation:-215.481,x:-1816.6,y:271.15},0).wait(1).to({rotation:-216.292,x:-1819.05,y:273.8},0).wait(1).to({rotation:-217.079,x:-1821.55,y:276.5},0).wait(1).to({rotation:-217.842,x:-1824.1,y:279.35},0).wait(1).to({rotation:-218.583,x:-1826.55,y:282.2},0).wait(1).to({rotation:-219.301,x:-1829.05,y:285.2},0).wait(1).to({rotation:-219.999,x:-1831.6,y:288.2},0).wait(1).to({rotation:-220.676,x:-1834.1,y:291.35},0).wait(1).to({rotation:-221.334,x:-1836.65,y:294.55},0).wait(1).to({rotation:-221.972,x:-1839.25,y:297.85},0).wait(1).to({rotation:-222.593,x:-1841.7,y:301.2},0).wait(1).to({rotation:-223.196,x:-1844.35,y:304.65},0).wait(1).to({rotation:-223.782,x:-1846.9,y:308.2},0).wait(1).to({rotation:-224.352,x:-1849.45,y:311.85},0).wait(1).to({rotation:-224.906,x:-1852,y:315.55},0).wait(1).to({rotation:-225.445,x:-1854.6,y:319.35},0).wait(1).to({rotation:-225.97,x:-1857.2,y:323.3},0).wait(1).to({rotation:-226.481,x:-1859.85,y:327.25},0).wait(1).to({rotation:-226.978,x:-1862.5,y:331.35},0).wait(1).to({rotation:-227.462,x:-1865.1,y:335.5},0).wait(1).to({rotation:-227.933,x:-1867.75,y:339.8},0).wait(1).to({rotation:-228.393,x:-1870.4,y:344.15},0).wait(1).to({rotation:-228.841,x:-1873,y:348.6},0).wait(1).to({rotation:-229.277,x:-1875.75,y:353.2},0).wait(1).to({rotation:-229.703,x:-1878.4,y:357.8},0).wait(1).to({rotation:-230.118,x:-1881.15,y:362.6},0).wait(1).to({rotation:-230.524,x:-1883.85,y:367.4},0).wait(1).to({rotation:-230.919,x:-1886.55,y:372.45},0).wait(1).to({rotation:-231.306,x:-1889.3,y:377.5},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_trears_2 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// trears_2
	this.instance = new lib.trears("synched",0);
	this.instance.setTransform(-1597.3,367.15,1,1,-105.0005,0,0,43.8,27.4);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(913).to({_off:false},0).wait(1).to({regX:48.8,regY:40.8,rotation:-105.601,x:-1588.7,y:354.25},0).wait(1).to({rotation:-106.228,x:-1591.9,y:349.75},0).wait(1).to({rotation:-106.864,x:-1595.05,y:345.3},0).wait(1).to({rotation:-107.51,x:-1598.25,y:341},0).wait(1).to({rotation:-108.165,x:-1601.4,y:336.8},0).wait(1).to({rotation:-108.829,x:-1604.6,y:332.65},0).wait(1).to({rotation:-109.504,x:-1607.75,y:328.6},0).wait(1).to({rotation:-110.188,x:-1610.95,y:324.6},0).wait(1).to({rotation:-110.882,x:-1614.2,y:320.7},0).wait(1).to({rotation:-111.585,x:-1617.35,y:316.9},0).wait(1).to({rotation:-112.299,x:-1620.6,y:313.2},0).wait(1).to({rotation:-113.023,x:-1623.85,y:309.6},0).wait(1).to({rotation:-113.757,x:-1627.1,y:306.05},0).wait(1).to({rotation:-114.501,x:-1630.35,y:302.6},0).wait(1).to({rotation:-115.255,x:-1633.6,y:299.15},0).wait(1).to({rotation:-116.02,x:-1636.95,y:295.85},0).wait(1).to({rotation:-116.794,x:-1640.25,y:292.6},0).wait(1).to({rotation:-117.579,x:-1643.55,y:289.45},0).wait(1).to({rotation:-118.374,x:-1646.85,y:286.35},0).wait(1).to({rotation:-119.179,x:-1650.2,y:283.35},0).wait(1).to({rotation:-119.994,x:-1653.5,y:280.4},0).wait(1).to({rotation:-120.819,x:-1656.85,y:277.55},0).wait(1).to({rotation:-121.654,x:-1660.2,y:274.75},0).wait(1).to({rotation:-122.498,x:-1663.6,y:272.05},0).wait(1).to({rotation:-123.352,x:-1667,y:269.35},0).wait(1).to({rotation:-124.216,x:-1670.4,y:266.8},0).wait(1).to({rotation:-125.089,x:-1673.85,y:264.25},0).wait(1).to({rotation:-125.971,x:-1677.3,y:261.85},0).wait(1).to({rotation:-126.861,x:-1680.7,y:259.5},0).wait(1).to({rotation:-127.761,x:-1684.2,y:257.15},0).wait(1).to({rotation:-128.668,x:-1687.7,y:254.95},0).wait(1).to({rotation:-129.584,x:-1691.15,y:252.8},0).wait(1).to({rotation:-130.508,x:-1694.7,y:250.7},0).wait(1).to({rotation:-131.439,x:-1698.15,y:248.65},0).wait(1).to({rotation:-132.378,x:-1701.7,y:246.7},0).wait(1).to({rotation:-133.323,x:-1705.25,y:244.8},0).wait(1).to({rotation:-134.274,x:-1708.8,y:242.95},0).wait(1).to({rotation:-135.232,x:-1712.4,y:241.25},0).wait(1).to({rotation:-136.195,x:-1715.95,y:239.5},0).wait(1).to({rotation:-137.163,x:-1719.6,y:237.9},0).wait(1).to({rotation:-138.136,x:-1723.2,y:236.35},0).wait(1).to({rotation:-139.113,x:-1726.85,y:234.85},0).wait(1).to({rotation:-140.094,x:-1730.55,y:233.45},0).wait(1).to({rotation:-141.078,x:-1734.1,y:232.1},0).wait(1).to({rotation:-142.066,x:-1737.8,y:230.8},0).wait(1).to({rotation:-143.055,x:-1741.55,y:229.6},0).wait(1).to({rotation:-144.046,x:-1745.25,y:228.4},0).wait(1).to({rotation:-145.038,x:-1748.95,y:227.35},0).wait(1).to({rotation:-146.031,x:-1752.65,y:226.3},0).wait(1).to({rotation:-147.024,x:-1756.45,y:225.35},0).wait(1).to({rotation:-148.017,x:-1760.25,y:224.45},0).wait(1).to({rotation:-149.009,x:-1764,y:223.65},0).wait(1).to({rotation:-150,x:-1767.8,y:222.85},0).wait(1).to({rotation:-150.988,x:-1771.6,y:222.15},0).wait(1).to({rotation:-151.974,x:-1775.5,y:221.5},0).wait(1).to({rotation:-152.957,x:-1779.25,y:220.95},0).wait(1).to({rotation:-153.937,x:-1783.15,y:220.45},0).wait(1).to({rotation:-154.913,x:-1787,y:220},0).wait(1).to({rotation:-155.884,x:-1790.95,y:219.6},0).wait(1).to({rotation:-156.851,x:-1794.75,y:219.35},0).wait(1).to({rotation:-157.812,x:-1798.75,y:219.05},0).wait(1).to({rotation:-158.767,x:-1802.65,y:218.9},0).wait(1).to({rotation:-159.716,x:-1806.6,y:218.85},0).wait(1).to({rotation:-160.659,x:-1810.6,y:218.75},0).wait(1).to({rotation:-161.594,x:-1814.55,y:218.8},0).wait(1).to({rotation:-162.522,x:-1818.55,y:218.85},0).wait(1).to({rotation:-163.443,x:-1822.55,y:219},0).wait(1).to({rotation:-164.356,x:-1826.6,y:219.2},0).wait(1).to({rotation:-165.26,x:-1830.65,y:219.5},0).wait(1).to({rotation:-166.156,x:-1834.75,y:219.8},0).wait(1).to({rotation:-167.043,x:-1838.75,y:220.2},0).wait(1).to({rotation:-167.921,x:-1842.85,y:220.7},0).wait(1).to({rotation:-168.79,x:-1846.95,y:221.25},0).wait(1).to({rotation:-169.65,x:-1851.1,y:221.85},0).wait(1).to({rotation:-170.5,x:-1855.25,y:222.5},0).wait(1).to({rotation:-171.34,x:-1859.45,y:223.2},0).wait(1).to({rotation:-172.171,x:-1863.65,y:224.05},0).wait(1).to({rotation:-172.991,x:-1867.8,y:224.9},0).wait(1).to({rotation:-173.801,x:-1872.05,y:225.85},0).wait(1).to({rotation:-174.602,x:-1876.3,y:226.85},0).wait(1).to({rotation:-175.392,x:-1880.55,y:227.95},0).wait(1).to({rotation:-176.172,x:-1884.85,y:229.05},0).wait(1).to({rotation:-176.941,x:-1889.1,y:230.25},0).wait(1).to({rotation:-177.7,x:-1893.45,y:231.55},0).wait(1).to({rotation:-178.449,x:-1897.8,y:232.85},0).wait(1).to({rotation:-179.188,x:-1902.15,y:234.25},0).wait(1).to({rotation:-179.917,x:-1906.55,y:235.75},0).wait(1).to({rotation:-180.635,x:-1910.95,y:237.3},0).wait(1).to({rotation:-181.343,x:-1915.4,y:238.9},0).wait(1).to({rotation:-182.041,x:-1919.85,y:240.65},0).wait(1).to({rotation:-182.729,x:-1924.35,y:242.35},0).wait(1).to({rotation:-183.407,x:-1928.8,y:244.2},0).wait(1).to({rotation:-184.075,x:-1933.4,y:246.1},0).wait(1).to({rotation:-184.734,x:-1937.95,y:248.1},0).wait(1).to({rotation:-185.383,x:-1942.55,y:250.2},0).wait(1).to({rotation:-186.022,x:-1947.15,y:252.25},0).wait(1).to({rotation:-186.651,x:-1951.75,y:254.5},0).wait(1).to({rotation:-187.272,x:-1956.4,y:256.8},0).wait(1).to({rotation:-187.883,x:-1961.15,y:259.1},0).wait(1).to({rotation:-188.485,x:-1965.85,y:261.55},0).wait(1).to({rotation:-189.078,x:-1970.65,y:264.05},0).wait(1).to({rotation:-189.663,x:-1975.4,y:266.65},0).wait(1).to({rotation:-190.238,x:-1980.2,y:269.3},0).wait(1).to({rotation:-190.805,x:-1985.1,y:272.05},0).wait(1).to({rotation:-191.364,x:-1990,y:274.9},0).wait(1).to({rotation:-191.914,x:-1994.9,y:277.85},0).wait(1).to({rotation:-192.456,x:-1999.9,y:280.85},0).wait(1).to({rotation:-192.991,x:-2004.85,y:283.95},0).wait(1).to({rotation:-193.517,x:-2009.95,y:287.15},0).wait(1).to({rotation:-194.036,x:-2015,y:290.4},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_trears_1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// trears_1
	this.instance = new lib.trears("synched",0);
	this.instance.setTransform(-1228.75,362,1,1,0,0,0,48.8,40.8);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(902).to({_off:false},0).wait(1).to({rotation:0.4326,x:-1225.2,y:357.15},0).wait(1).to({rotation:0.8878,x:-1221.75,y:352.5},0).wait(1).to({rotation:1.3525,x:-1218.25,y:347.95},0).wait(1).to({rotation:1.8272,x:-1214.85,y:343.45},0).wait(1).to({rotation:2.312,x:-1211.4,y:339},0).wait(1).to({rotation:2.8073,x:-1207.95,y:334.8},0).wait(1).to({rotation:3.3134,x:-1204.55,y:330.6},0).wait(1).to({rotation:3.8306,x:-1201.2,y:326.45},0).wait(1).to({rotation:4.3592,x:-1197.8,y:322.5},0).wait(1).to({rotation:4.8996,x:-1194.5,y:318.55},0).wait(1).to({rotation:5.4521,x:-1191.1,y:314.75},0).wait(1).to({rotation:6.017,x:-1187.8,y:311},0).wait(1).to({rotation:6.5947,x:-1184.45,y:307.4},0).wait(1).to({rotation:7.1856,x:-1181.2,y:303.85},0).wait(1).to({rotation:7.79,x:-1177.9,y:300.35},0).wait(1).to({rotation:8.4083,x:-1174.6,y:297},0).wait(1).to({rotation:9.0408,x:-1171.35,y:293.7},0).wait(1).to({rotation:9.6881,x:-1168.15,y:290.5},0).wait(1).to({rotation:10.3503,x:-1164.95,y:287.4},0).wait(1).to({rotation:11.028,x:-1161.7,y:284.4},0).wait(1).to({rotation:11.7216,x:-1158.5,y:281.4},0).wait(1).to({rotation:12.4314,x:-1155.3,y:278.55},0).wait(1).to({rotation:13.1578,x:-1152.15,y:275.8},0).wait(1).to({rotation:13.9013,x:-1148.95,y:273.05},0).wait(1).to({rotation:14.6622,x:-1145.8,y:270.4},0).wait(1).to({rotation:15.4409,x:-1142.6,y:267.95},0).wait(1).to({rotation:16.2378,x:-1139.5,y:265.4},0).wait(1).to({rotation:17.0532,x:-1136.35,y:263.05},0).wait(1).to({rotation:17.8876,x:-1133.25,y:260.75},0).wait(1).to({rotation:18.7413,x:-1130.15,y:258.55},0).wait(1).to({rotation:19.6146,x:-1127.05,y:256.4},0).wait(1).to({rotation:20.5079,x:-1123.95,y:254.25},0).wait(1).to({rotation:21.4213,x:-1120.85,y:252.25},0).wait(1).to({rotation:22.3553,x:-1117.75,y:250.35},0).wait(1).to({rotation:23.31,x:-1114.75,y:248.45},0).wait(1).to({rotation:24.2857,x:-1111.7,y:246.7},0).wait(1).to({rotation:25.2825,x:-1108.6,y:245.05},0).wait(1).to({rotation:26.3005,x:-1105.6,y:243.4},0).wait(1).to({rotation:27.3398,x:-1102.6,y:241.85},0).wait(1).to({rotation:28.4004,x:-1099.5,y:240.35},0).wait(1).to({rotation:29.4824,x:-1096.55,y:238.9},0).wait(1).to({rotation:30.5856,x:-1093.55,y:237.6},0).wait(1).to({rotation:31.7099,x:-1090.55,y:236.35},0).wait(1).to({rotation:32.8551,x:-1087.55,y:235.1},0).wait(1).to({rotation:34.0208,x:-1084.6,y:234},0).wait(1).to({rotation:35.2067,x:-1081.6,y:233},0).wait(1).to({rotation:36.4123,x:-1078.6,y:232},0).wait(1).to({rotation:37.6372,x:-1075.65,y:231.1},0).wait(1).to({rotation:38.8807,x:-1072.65,y:230.3},0).wait(1).to({rotation:40.142,x:-1069.75,y:229.5},0).wait(1).to({rotation:41.4204,x:-1066.8,y:228.85},0).wait(1).to({rotation:42.7151,x:-1063.9,y:228.25},0).wait(1).to({rotation:44.0249,x:-1060.9,y:227.65},0).wait(1).to({rotation:45.349,x:-1057.95,y:227.15},0).wait(1).to({rotation:46.6861,x:-1055.05,y:226.75},0).wait(1).to({rotation:48.0351,x:-1052.15,y:226.45},0).wait(1).to({rotation:49.3946,x:-1049.3,y:226.15},0).wait(1).to({rotation:50.7633,x:-1046.35,y:225.95},0).wait(1).to({rotation:52.1397,x:-1043.4,y:225.85},0).wait(1).to({rotation:53.5225,x:-1040.55,y:225.8},0).wait(1).to({rotation:54.9101,x:-1037.65},0).wait(1).to({rotation:56.3009,x:-1034.75,y:225.9},0).wait(1).to({rotation:57.6935,x:-1031.85,y:226},0).wait(1).to({rotation:59.0862,x:-1029,y:226.2},0).wait(1).to({rotation:60.4774,x:-1026.1,y:226.5},0).wait(1).to({rotation:61.8656,x:-1023.25,y:226.95},0).wait(1).to({rotation:63.2493,x:-1020.4,y:227.35},0).wait(1).to({rotation:64.6269,x:-1017.5,y:227.85},0).wait(1).to({rotation:65.997,x:-1014.6,y:228.45},0).wait(1).to({rotation:67.3581,x:-1011.75,y:229.05},0).wait(1).to({rotation:68.7088,x:-1008.95,y:229.75},0).wait(1).to({rotation:70.048,x:-1006.1,y:230.5},0).wait(1).to({rotation:71.3743,x:-1003.2,y:231.45},0).wait(1).to({rotation:72.6866,x:-1000.4,y:232.35},0).wait(1).to({rotation:73.9838,x:-997.55,y:233.35},0).wait(1).to({rotation:75.265,x:-994.7,y:234.45},0).wait(1).to({rotation:76.5293,x:-991.9,y:235.55},0).wait(1).to({rotation:77.7757,x:-989,y:236.8},0).wait(1).to({rotation:79.0038,x:-986.2,y:238.05},0).wait(1).to({rotation:80.2127,x:-983.35,y:239.45},0).wait(1).to({rotation:81.4019,x:-980.5,y:240.85},0).wait(1).to({rotation:82.5711,x:-977.7,y:242.35},0).wait(1).to({rotation:83.7197,x:-974.85,y:243.9},0).wait(1).to({rotation:84.8475,x:-972.05,y:245.55},0).wait(1).to({rotation:85.9543,x:-969.2,y:247.35},0).wait(1).to({rotation:87.0399,x:-966.4,y:249.1},0).wait(1).to({rotation:88.1043,x:-963.6,y:250.95},0).wait(1).to({rotation:89.1473,x:-960.7,y:252.95},0).wait(1).to({rotation:90.169,x:-957.9,y:255},0).wait(1).to({rotation:91.1694,x:-955.1,y:257.05},0).wait(1).to({rotation:92.1488,x:-952.25,y:259.2},0).wait(1).to({rotation:93.1071,x:-949.45,y:261.55},0).wait(1).to({rotation:94.0448,x:-946.65,y:263.85},0).wait(1).to({rotation:94.9619,x:-943.8,y:266.2},0).wait(1).to({rotation:95.8587,x:-941,y:268.75},0).wait(1).to({rotation:96.7356,x:-938.1,y:271.3},0).wait(1).to({rotation:97.5929,x:-935.35,y:273.9},0).wait(1).to({rotation:98.4308,x:-932.5,y:276.65},0).wait(1).to({rotation:99.2497,x:-929.65,y:279.5},0).wait(1).to({rotation:100.05,x:-926.8,y:282.4},0).wait(1).to({rotation:100.832,x:-924,y:285.4},0).wait(1).to({rotation:101.596,x:-921.15,y:288.4},0).wait(1).to({rotation:102.343,x:-918.4,y:291.55},0).wait(1).to({rotation:103.073,x:-915.55,y:294.8},0).wait(1).to({rotation:103.786,x:-912.7,y:298.15},0).wait(1).to({rotation:104.483,x:-909.85,y:301.5},0).wait(1).to({rotation:105.164,x:-907.05,y:305},0).wait(1).to({rotation:105.829,x:-904.15,y:308.55},0).wait(1).to({rotation:106.479,x:-901.3,y:312.25},0).wait(1).to({rotation:107.115,x:-898.5,y:316},0).wait(1).to({rotation:107.736,x:-895.6,y:319.8},0).wait(1).to({rotation:108.344,x:-892.8,y:323.7},0).wait(1).to({rotation:108.937,x:-889.95,y:327.75},0).wait(1).to({rotation:109.518,x:-887.05,y:331.9},0).wait(1).to({rotation:110.086,x:-884.2,y:336.15},0).wait(1).to({rotation:110.641,x:-881.35,y:340.4},0).wait(1).to({rotation:111.184,x:-878.5,y:344.8},0).wait(1).to({rotation:111.716,x:-875.6,y:349.35},0).wait(1).to({rotation:112.236,x:-872.65,y:353.9},0).wait(1).to({rotation:112.745,x:-869.8,y:358.7},0).wait(1).to({rotation:113.243,x:-866.95,y:363.5},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_sun2 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// sun2
	this.instance = new lib.sun2("synched",1);
	this.instance.setTransform(1634.25,-121.9,1.0161,0.4746,-120.0008,0,0,1794.7,1177);

	this.instance_1 = new lib.sun2("synched",1);
	this.instance_1.setTransform(-1150.6,66.5,0.9554,0.6285,-9.479,0,0,1794.9,1176.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance_1,p:{scaleX:0.9554,scaleY:0.6285,rotation:-9.479,x:-1150.6,y:66.5,startPosition:1}},{t:this.instance,p:{regX:1794.7,regY:1177,scaleX:1.0161,scaleY:0.4746,rotation:-120.0008,x:1634.25,y:-121.9,startPosition:1}}]},1).to({state:[{t:this.instance_1,p:{scaleX:0.9553,scaleY:0.6284,rotation:-9.4772,x:-1199.6,y:35,startPosition:102}},{t:this.instance,p:{regX:1794.6,regY:1177.1,scaleX:1.016,scaleY:0.4745,rotation:-120.0013,x:1585,y:-153.3,startPosition:102}}]},352).to({state:[]},546).to({state:[{t:this.instance_1,p:{scaleX:0.9553,scaleY:0.6284,rotation:-9.4772,x:-1199.6,y:35,startPosition:99}},{t:this.instance,p:{regX:1794.6,regY:1177.1,scaleX:1.016,scaleY:0.4745,rotation:-120.0013,x:1585,y:-153.3,startPosition:99}}]},125).wait(315));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_sun1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// sun1
	this.instance = new lib.sun1("synched",1);
	this.instance.setTransform(1906.5,826.25,1.2369,1.1636,-93.4476,0,0,941.5,941.6);

	this.instance_1 = new lib.sun1("synched",1);
	this.instance_1.setTransform(949.65,495.3,1.1802,1.1498,-69.4742,0,0,941.4,941.4);

	this.instance_2 = new lib.sun1("synched",1);
	this.instance_2.setTransform(304.2,675.95,0.7022,0.714,-42.6886,0,0,941.4,941.4);

	this.instance_3 = new lib.sun1("synched",1);
	this.instance_3.setTransform(-337.3,484.9,1,1,-14.9992,0,0,941.5,941.4);

	this.instance_4 = new lib.sun1("synched",1);
	this.instance_4.setTransform(-909.95,589.8,1,1,0,0,0,941.5,941.5);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(182,242,252,0.698)").s().p("ECQAAU/QhZhZAGh5QAGh5BzhkQB0hkBHgHQBIgHBuBkQBuBkACCAQACCAhZBZQhZBZh/AAQh+AAhahZgEiWzgIzQhZhZAGh5QAGh5BzhkQB0hkBHgHQBIgHBuBkQBuBkACCAQACCAhZBZQhZBZh/AAQh+AAhahZgAK1t9QhZhZAGh5QAFh5B0hkQBzhkBIgHQBHgHBuBkQBuBkADCAQACCAhaBZQhZBZh+AAQh/AAhZhZg");
	this.shape.setTransform(114.7714,1798.624);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape},{t:this.instance_4,p:{startPosition:1}},{t:this.instance_3,p:{startPosition:1}},{t:this.instance_2,p:{startPosition:1}},{t:this.instance_1,p:{startPosition:1}},{t:this.instance,p:{startPosition:1}}]},1).to({state:[]},898).to({state:[{t:this.shape},{t:this.instance_4,p:{startPosition:42}},{t:this.instance_3,p:{startPosition:42}},{t:this.instance_2,p:{startPosition:42}},{t:this.instance_1,p:{startPosition:42}},{t:this.instance,p:{startPosition:42}}]},117).wait(323));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_small_fish = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// small_fish
	this.instance = new lib.small_fish();
	this.instance.setTransform(-956.35,884.1,1,1,-44.9994,0,0,98,36.9);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(619).to({_off:false},0).wait(1).to({regX:417.7,regY:46.6,rotation:-44.437,x:-697.65,y:654.1},0).wait(1).to({rotation:-43.8541,x:-671.75,y:643.8},0).wait(1).to({rotation:-43.2626,x:-646,y:633.9},0).wait(1).to({rotation:-42.6625,x:-620.25,y:624.35},0).wait(1).to({rotation:-42.0536,x:-594.55,y:615.2},0).wait(1).to({rotation:-41.436,x:-568.9,y:606.5},0).wait(1).to({rotation:-40.8096,x:-543.3,y:598.1},0).wait(1).to({rotation:-40.1743,x:-517.7,y:590.2},0).wait(1).to({rotation:-39.5301,x:-492.2,y:582.65},0).wait(1).to({rotation:-38.877,x:-466.75,y:575.5},0).wait(1).to({rotation:-38.215,x:-441.25,y:568.7},0).wait(1).to({rotation:-37.5441,x:-415.9,y:562.35},0).wait(1).to({rotation:-36.8643,x:-390.6,y:556.45},0).wait(1).to({rotation:-36.1755,x:-365.35,y:550.85},0).wait(1).to({rotation:-35.4779,x:-340.1,y:545.75},0).wait(1).to({rotation:-34.7715,x:-314.9,y:541},0).wait(1).to({rotation:-34.0562,x:-289.85,y:536.65},0).wait(1).to({rotation:-33.3323,x:-264.8,y:532.75},0).wait(1).to({rotation:-32.5996,x:-239.85,y:529.15},0).wait(1).to({rotation:-31.8584,x:-214.95,y:526.05},0).wait(1).to({rotation:-31.1088,x:-190.1,y:523.3},0).wait(1).to({rotation:-30.3508,x:-165.35,y:520.95},0).wait(1).to({rotation:-29.5846,x:-140.65,y:519},0).wait(1).to({rotation:-28.8103,x:-116.05,y:517.5},0).wait(1).to({rotation:-28.028,x:-91.5,y:516.4},0).wait(1).to({rotation:-27.238,x:-67,y:515.65},0).wait(1).to({rotation:-26.4405,x:-42.7,y:515.25},0).wait(1).to({rotation:-25.6356,x:-18.4,y:515.35},0).wait(1).to({rotation:-24.8236,x:5.8,y:515.85},0).wait(1).to({rotation:-24.0046,x:29.9,y:516.65},0).wait(1).to({rotation:-23.179,x:54,y:517.95},0).wait(1).to({rotation:-22.347,x:77.85,y:519.55},0).wait(1).to({rotation:-21.5089,x:101.7,y:521.55},0).wait(1).to({rotation:-20.665,x:125.4,y:524},0).wait(1).to({rotation:-19.8155,x:149.05,y:526.8},0).wait(1).to({rotation:-18.9609,x:172.6,y:529.95},0).wait(1).to({rotation:-18.1014,x:196,y:533.55},0).wait(1).to({rotation:-17.2374,x:219.3,y:537.45},0).wait(1).to({rotation:-16.3693,x:242.5,y:541.8},0).wait(1).to({rotation:-15.4973,x:265.6,y:546.5},0).wait(1).to({rotation:-14.622,x:288.55,y:551.55},0).wait(1).to({rotation:-13.7437,x:311.45,y:556.95},0).wait(1).to({rotation:-12.8628,x:334.15,y:562.75},0).wait(1).to({rotation:-11.9796,x:356.8,y:568.9},0).wait(1).to({rotation:-11.0947,x:379.35,y:575.45},0).wait(1).to({rotation:-10.2084,x:401.75,y:582.25},0).wait(1).to({rotation:-9.3211,x:423.95,y:589.5},0).wait(1).to({rotation:-8.4333,x:446.1,y:597.05},0).wait(1).to({rotation:-7.5454,x:468.1,y:604.9},0).wait(1).to({rotation:-6.6579,x:490.1,y:613.15},0).wait(1).to({rotation:-5.771,x:511.85,y:621.7},0).wait(1).to({rotation:-4.8853,x:533.5,y:630.65},0).wait(1).to({rotation:-4.0013,x:555.05,y:639.85},0).wait(1).to({rotation:-3.1192,x:576.5,y:649.45},0).wait(1).to({rotation:-2.2395,x:597.8,y:659.3},0).wait(1).to({rotation:-1.3626,x:619,y:669.5},0).wait(1).to({rotation:-0.4889,x:640.05,y:680},0).wait(1).to({rotation:0.3812,x:661.05,y:690.8},0).wait(1).to({rotation:1.2473,x:681.9,y:701.95},0).wait(1).to({rotation:2.1091,x:702.6,y:713.35},0).wait(1).to({rotation:2.9662,x:723.2,y:725.15},0).wait(1).to({rotation:3.8183,x:743.65,y:737.15},0).wait(1).to({rotation:4.665,x:764.05,y:749.5},0).wait(1).to({rotation:5.5061,x:784.35,y:762.2},0).wait(1).to({rotation:6.3412,x:804.5,y:775.05},0).wait(1).to({rotation:7.17,x:824.55,y:788.3},0).wait(1).to({rotation:7.9924,x:844.5,y:801.8},0).wait(1).to({rotation:8.8079,x:864.35,y:815.55},0).wait(1).to({rotation:9.6164,x:884.05,y:829.6},0).wait(1).to({rotation:10.4177,x:903.75,y:844.05},0).wait(1).to({rotation:11.2115,x:923.3,y:858.6},0).wait(1).to({rotation:11.9976,x:942.75,y:873.5},0).wait(1).to({rotation:12.7759,x:962.15,y:888.7},0).wait(1).to({rotation:13.5462,x:981.45,y:904.2},0).wait(1).to({rotation:14.3084,x:1000.65,y:919.95},0).wait(1).to({rotation:15.0622,x:1019.75,y:935.95},0).wait(1).to({rotation:15.8077,x:1038.75,y:952.25},0).wait(1).to({rotation:16.5446,x:1057.75,y:968.75},0).wait(1).to({rotation:17.2729,x:1076.55,y:985.6},0).wait(1).to({rotation:17.9925,x:1095.35,y:1002.65},0).wait(1).to({rotation:18.7034,x:1114.1,y:1020.1},0).wait(1).to({rotation:19.4055,x:1132.7,y:1037.75},0).wait(1).to({rotation:20.0987,x:1151.3,y:1055.65},0).wait(1).to({rotation:20.783,x:1169.8,y:1073.8},0).wait(1).to({rotation:21.4584,x:1188.25,y:1092.25},0).wait(1).to({rotation:22.1248,x:1206.65,y:1111},0).wait(1).to({rotation:22.7824,x:1224.95,y:1130},0).wait(1).to({rotation:23.431,x:1243.15,y:1149.3},0).wait(1).to({rotation:24.0708,x:1261.35,y:1168.8},0).wait(1).to({rotation:24.7017,x:1279.5,y:1188.65},0).wait(1).to({rotation:25.3237,x:1297.6,y:1208.7},0).wait(1).to({rotation:25.937,x:1315.6,y:1229.1},0).wait(1).to({rotation:26.5415,x:1333.6,y:1249.75},0).wait(1).to({rotation:27.1373,x:1351.5,y:1270.65},0).wait(1).to({rotation:27.7245,x:1369.4,y:1291.85},0).wait(1).to({rotation:28.3032,x:1387.2,y:1313.35},0).wait(1).to({rotation:28.8734,x:1404.95,y:1335.1},0).to({_off:true},1).wait(538));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_moshe_cry = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// moshe_cry
	this.instance = new lib.cry();
	this.instance.setTransform(-1406.4,564.65,0.9994,0.9994,0,0,0,258.1,282);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(899).to({_off:false},0).wait(125));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_fish2_entrance = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// fish2_entrance
	this.instance = new lib.fish2_sailence();
	this.instance.setTransform(-1133.95,1302.6,0.8,0.8937,0,0,180,620.6,229.5);

	this.instance_1 = new lib.fish2_talk();
	this.instance_1.setTransform(-1020.75,1297.1,0.8,0.8937,0,0,180,479.1,222.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance}]},636).to({state:[{t:this.instance_1}]},170).wait(93));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_fish2 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// fish2
	this.instance = new lib.fish2_sailence();
	this.instance.setTransform(-1133.95,1302.6,0.8,0.8937,0,0,180,620.6,229.5);

	this.instance_1 = new lib.fish2_talk();
	this.instance_1.setTransform(-1020.75,1297.1,0.8,0.8937,0,0,180,479.1,222.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance}]},1024).to({state:[{t:this.instance_1}]},17).to({state:[{t:this.instance}]},68).wait(230));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_buttoms = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// buttoms
	this.start = new lib.start();
	this.start.name = "start";
	this.start.setTransform(1174.65,1491.1,1.6086,1.6086,0,0,0,447,734.8);

	this.replay = new lib.repaly();
	this.replay.name = "replay";
	this.replay.setTransform(-429.2,1426.75,0.9999,0.9999,0,0,0,458.1,474.7);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.start}]}).to({state:[]},1).to({state:[{t:this.replay}]},1338).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_bubbles1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// bubbles1
	this.instance = new lib.bubbles2("synched",0);
	this.instance.setTransform(417.4,3586.55,0.2385,0.2385,0,0,180,-1838.2,769.2);

	this.instance_1 = new lib.bubbles2("synched",0);
	this.instance_1.setTransform(52.35,2942.05,1,1,0,0,0,-1838.2,769.4);

	this.instance_2 = new lib.bubbles2("synched",0);
	this.instance_2.setTransform(152.1,2360.5,1,1,0,0,0,-1838.2,769.2);

	this.instance_3 = new lib.bubbles2("synched",0);
	this.instance_3.setTransform(1988.05,3860.5,1,1,0,0,0,-1838.2,769.3);

	this.instance_4 = new lib.bubbles2("synched",0);
	this.instance_4.setTransform(516.4,2940.6,0.7602,0.5356,0,0,0,-1838,769.4);

	this.instance_5 = new lib.bubbles2("synched",0);
	this.instance_5.setTransform(-318.45,2282.2,1,1,0,0,0,-1838.2,769.3);

	this.instance_6 = new lib.bubbles2("synched",0);
	this.instance_6.setTransform(-862.7,2990.15,0.6572,0.6572,0,0,0,-1838,769.4);

	this.instance_7 = new lib.bubbles2("synched",0);
	this.instance_7.setTransform(-709.3,3884.55,1,1,0,0,0,-1838.2,769.2);

	this.instance_8 = new lib.bubbles2("synched",0);
	this.instance_8.setTransform(-1558.05,2746.25,1,1,0,0,0,-1838.2,769.3);

	this.instance_9 = new lib.bubbles2("synched",0);
	this.instance_9.setTransform(-1504.5,5312.35,1,1,0,0,0,-1838.2,769.3);

	this.instance_10 = new lib.bubbles2("synched",0);
	this.instance_10.setTransform(1692.65,3441.9,1,1,0,0,0,-1838.2,769.3);

	this.instance_11 = new lib.bubbles2("synched",0);
	this.instance_11.setTransform(-2200.2,3950.8,1,1,0,0,0,-1838.2,769.2);

	this.instance_12 = new lib.bubbles2("synched",0);
	this.instance_12.setTransform(-1807.3,4438.75,1,1,0,0,0,-1838.2,769.3);

	this.instance_13 = new lib.bubbles2("synched",0);
	this.instance_13.setTransform(2743.8,3032.2,1,1,0,0,0,-1838.2,769.3);

	this.instance_14 = new lib.bubbles2("synched",0);
	this.instance_14.setTransform(839.05,4779.1,1,1,0,0,0,-1838.2,769.3);

	this.instance_15 = new lib.bubbles2("synched",0);
	this.instance_15.setTransform(-344.9,4580.35,1,1,0,0,0,-1838.2,769.2);

	this.instance_16 = new lib.bubbles2("synched",1);
	this.instance_16.setTransform(-339.65,-899.15,0.6,0.6,0,0,0,-1838.2,769.2);

	this.instance_17 = new lib.bubbles2("synched",1);
	this.instance_17.setTransform(-529.45,-659.4,0.5,0.5,0,0,0,-1838.1,769.2);

	this.instance_18 = new lib.bubbles2("synched",1);
	this.instance_18.setTransform(-799.2,909.1,0.4,0.4,0,0,0,-1838.2,769.4);

	this.instance_19 = new lib.bubbles2("synched",1);
	this.instance_19.setTransform(2867.25,1128.9,0.3,0.3,0,0,0,-1838,769.4);

	this.instance_20 = new lib.bubbles2("synched",1);
	this.instance_20.setTransform(-2267.75,1048.95,0.2,0.2,0,0,0,-1838.3,769.5);

	this.instance_21 = new lib.bubbles2("synched",1);
	this.instance_21.setTransform(3476.65,369.6,1,1,0,0,0,109.9,109.9);

	this.instance_22 = new lib.bubbles1("synched",1);
	this.instance_22.setTransform(1078.95,-679.35,0.7,0.7,0,0,0,342.2,751.8);

	this.instance_23 = new lib.bubbles1("synched",1);
	this.instance_23.setTransform(179.85,-149.85,1,1,0,0,0,342.2,751.8);

	this.instance_24 = new lib.bubbles1("synched",1);
	this.instance_24.setTransform(1742.25,-442.6,0.6,0.6,0,0,0,342.2,751.8);

	this.instance_25 = new lib.bubbles1("synched",1);
	this.instance_25.setTransform(-1666.2,-732.85,0.5,0.5,0,0,0,342.2,751.7);

	this.instance_26 = new lib.bubbles1("synched",1);
	this.instance_26.setTransform(40,839.15,1,1,0,0,0,342.2,751.8);

	this.instance_27 = new lib.bubbles1("synched",1);
	this.instance_27.setTransform(859.2,0,1,1,0,0,0,342.2,751.8);

	this.instance_28 = new lib.bubbles1("synched",1);
	this.instance_28.setTransform(-1770,-693.3,1,1,0,0,0,342.2,751.8);

	this.instance_29 = new lib.bubbles1("synched",1);
	this.instance_29.setTransform(2877.2,-949.1,1,1,0,0,0,342.2,751.8);

	this.instance_30 = new lib.bubbles1("synched",1);
	this.instance_30.setTransform(2395.35,-822.4,0.55,0.55,0,0,0,342.2,751.8);

	this.instance_31 = new lib.bubbles1("synched",1);
	this.instance_31.setTransform(-2026,-1385.3,1,1,0,0,0,342.2,751.8);

	this.instance_32 = new lib.bubbles1("synched",1);
	this.instance_32.setTransform(-684.9,-1143.85,0.8,0.8564,0,0,0,342,751.7);

	this.instance_33 = new lib.bubbles1("synched",1);
	this.instance_33.setTransform(-1408.6,559.45,1,1,0,0,0,342.2,751.8);

	this.instance_34 = new lib.bubbles1("synched",1);
	this.instance_34.setTransform(-319.65,-509.5,1,1,0,0,0,342.2,751.8);

	this.instance_35 = new lib.bubbles1("synched",1);
	this.instance_35.setTransform(1528.6,-364.55,0.9,0.9,0,0,0,342.2,751.8);

	this.instance_36 = new lib.bubbles1("synched",1);
	this.instance_36.setTransform(-960.35,-159.7,0.6,0.6,0,0,0,342.2,751.8);

	this.instance_37 = new lib.bubbles1("synched",1);
	this.instance_37.setTransform(434.65,-984,1,1,0,0,0,82.5,82.5);

	this.instance_38 = new lib.bubbles1("synched",1);
	this.instance_38.setTransform(424.65,-1033.95,1,1,0,0,0,82.5,82.5);

	this.instance_39 = new lib.bubbles1("synched",1);
	this.instance_39.setTransform(1901.3,62.5,1,1,0,0,0,82.5,82.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance_39,p:{startPosition:1}},{t:this.instance_38,p:{startPosition:1}},{t:this.instance_37,p:{startPosition:1}},{t:this.instance_36,p:{startPosition:1}},{t:this.instance_35,p:{startPosition:1}},{t:this.instance_34,p:{startPosition:1}},{t:this.instance_33,p:{startPosition:1}},{t:this.instance_32,p:{startPosition:1}},{t:this.instance_31,p:{startPosition:1}},{t:this.instance_30,p:{startPosition:1}},{t:this.instance_29,p:{startPosition:1}},{t:this.instance_28,p:{startPosition:1}},{t:this.instance_27,p:{startPosition:1}},{t:this.instance_26,p:{startPosition:1}},{t:this.instance_25,p:{startPosition:1}},{t:this.instance_24,p:{startPosition:1}},{t:this.instance_23,p:{startPosition:1}},{t:this.instance_22,p:{startPosition:1}},{t:this.instance_21},{t:this.instance_20},{t:this.instance_19},{t:this.instance_18},{t:this.instance_17},{t:this.instance_16},{t:this.instance_15},{t:this.instance_14},{t:this.instance_13},{t:this.instance_12},{t:this.instance_11},{t:this.instance_10},{t:this.instance_9},{t:this.instance_8},{t:this.instance_7},{t:this.instance_6},{t:this.instance_5,p:{regX:-1838.2,regY:769.3,x:-318.45,y:2282.2,startPosition:0}},{t:this.instance_4,p:{regX:-1838,regY:769.4,scaleX:0.7602,scaleY:0.5356,x:516.4,y:2940.6,startPosition:0}},{t:this.instance_3,p:{regX:-1838.2,regY:769.3,scaleX:1,scaleY:1,x:1988.05,y:3860.5,startPosition:0}},{t:this.instance_2,p:{regY:769.2,scaleX:1,scaleY:1,x:152.1,y:2360.5,startPosition:0}},{t:this.instance_1,p:{regX:-1838.2,regY:769.4,scaleX:1,scaleY:1,x:52.35,y:2942.05,startPosition:0}},{t:this.instance,p:{scaleX:0.2385,scaleY:0.2385,skewY:180,x:417.4,y:3586.55,startPosition:0}}]},1).to({state:[]},898).to({state:[{t:this.instance_39,p:{startPosition:84}},{t:this.instance_38,p:{startPosition:84}},{t:this.instance_37,p:{startPosition:84}},{t:this.instance_36,p:{startPosition:84}},{t:this.instance_35,p:{startPosition:84}},{t:this.instance_34,p:{startPosition:84}},{t:this.instance_33,p:{startPosition:84}},{t:this.instance_32,p:{startPosition:84}},{t:this.instance_31,p:{startPosition:84}},{t:this.instance_30,p:{startPosition:84}},{t:this.instance_29,p:{startPosition:84}},{t:this.instance_28,p:{startPosition:84}},{t:this.instance_27,p:{startPosition:84}},{t:this.instance_26,p:{startPosition:84}},{t:this.instance_25,p:{startPosition:84}},{t:this.instance_24,p:{startPosition:84}},{t:this.instance_23,p:{startPosition:84}},{t:this.instance_22,p:{startPosition:84}},{t:this.instance_5,p:{regX:109.9,regY:109.9,x:3476.65,y:369.6,startPosition:81}},{t:this.instance_4,p:{regX:-1838.3,regY:769.5,scaleX:0.2,scaleY:0.2,x:-2267.75,y:1048.95,startPosition:81}},{t:this.instance_3,p:{regX:-1838,regY:769.4,scaleX:0.3,scaleY:0.3,x:2867.25,y:1128.9,startPosition:81}},{t:this.instance_2,p:{regY:769.4,scaleX:0.4,scaleY:0.4,x:-799.2,y:909.1,startPosition:81}},{t:this.instance_1,p:{regX:-1838.1,regY:769.2,scaleX:0.5,scaleY:0.5,x:-529.45,y:-659.4,startPosition:81}},{t:this.instance,p:{scaleX:0.6,scaleY:0.6,skewY:0,x:-339.65,y:-899.15,startPosition:81}}]},125).wait(315));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_background4 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// background4
	this.instance = new lib.plants1("synched",0);
	this.instance.setTransform(-1436.8,1499.75,1,1,0,0,0,362.1,422.3);

	this.instance_1 = new lib.plants3();
	this.instance_1.setTransform(2262.4,1719.85,1,1,0,0,0,169.3,176.6);

	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#323232").ss(3,1,1).p("Ego+gGBMA4DAAbQg1hvh1iUQjpknk3i1QjiiDj4g8EghzgOBQiHkOkHjzQoOnmqBCHQj7A0khAwQgsAIgtAHQlVA2hgAUQjLAritBIQjDBRj8CbQm2EOh6EoQg8CVAbBeIBMABMA24AAaAvl0iQokBOpqFTQlsDphfEXEBhMAb/QiMgiiaADQhRABhUAM");
	this.shape.setTransform(-1535.1666,2049.1064);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#416B7D").s().p("AAEKxQBfkXFsjpQJqlSIkhOQCNgUCKgDQEDgFDsA6QD5A8DiCDQE3C0DpEnQB1CUA1BvgEg2zAKXIhMgBQgbheA8iVQB6koG2kNQD8ibDDhRQCthIDLgrQBggUFVg2QAtgHAsgIQEhgwD7g0QKBiHINHmQEHDzCHENQlsDphfEXg");
	this.shape_1.setTransform(-1797.8916,1941.6314);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#826DAD").s().p("EgevA8nItBAAMgAbh1LIAFgJQBCiBBvhHQDliVDsEwQDsEvCHUQQBDKHAVJLQASjOAskoQBYpQB+nDQCxp3DmkEQAfgjAfgbQAigfAigVQDriVESDZIAXAWQAdAdAcApQBYCBAsC7QCOJYliPBQDzo9E8niQBbiLBVhsQD5k/DMhFQDVhKCjDHIAaAQQAeAbAYAwQBLCYgYE6UgBKAPtgQFAjCQB2jGC8kYQF4oyFbmkQHnpLFrjZQA4giA1gYQFZihDIDoQAQATAOAUIARAwQAUBAANBOQAqD7gmE0Qh5PYttScItESjIwARSg");
	this.shape_2.setTransform(-2264.6725,1616.5356);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#433A76").s().p("Ego7BGLId/AAIQAxSINEyjQNtydB5vZQAmkygqj8QgNhOgUg/IgRgwQgOgVgQgSQUPq5A6SWIiyE6QjbF7jTFFQonNRlFDeQDphREKhCQG2huEHAHQFRAIAADLIgTA/QgdBSgtBgQiTEzkJFJQkEFBlVExQgsAIgtAGQlVA2hgAVQjLAritBHQjDBRj8CbQm2EOh6EpQg8CUAbBfIBMABIhnA1gAcxc5QhmAlgOAMQgQAMBjgdQA9gTBKgyQg0ASgyATgAKE7XQAYk5hLiZQgYgwgegaIgagQQijjIjVBKQAwhLAzhFQE5mvEzisQF/jXFhDMQGQDoCkDVQCzDngjEhQgiEhkBGnQiqEak2GWQg1AZg4AhQlrDannJKQlbGkl3IyQi8EZh2DFUAQEgjCABKgPtgEgmdgW4QiH0PjskwQjskvjlCUQhvBIhCCAIgFjjQAQiDAqi1QBSlpB7j0QCrlWDig9QEahMFhFzQJPJtgjOZQgfAcgfAjQjmEDixJ4Qh+HDhYJQQgsEogSDNQgVpKhDqIgEgNHgkAQgsi7hYiBQgcgogdgeIgXgWQkSjZjrCWQBnlCBtkJQEPqVEIjKQFIj9EpHiIh/ejQhVBthbCKQk9HijzI+QFivBiOpZg");
	this.shape_3.setTransform(-2199.475,1555.3617);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#DD5B18").s().p("EgjlALaQgEhcAehOQAth1BsALIgBgBQBxgLAhAAQBoAAC0CgQgwiggSigQgkk/CWAAIApgKQA1gJA4AFQC0AQCWCVQCFCGCLBYQCaBjBGA/QAgAdAEgBQAEAAgRgdQhNiHgbg6Qi2mBB3kUIAmhGQAzhHBBgKQDQgeEOJcQCSFIANg9QAIglg1k4Qg9ljgGibQgJj8BqAlQB+AtCYEZQBWCgBfDsQB6EzBXEoIALAiIgBgiQgBlIArksQAPhtAUhWQBhmeDLB4QD1CRCKH9QA3DMAYC5IAJBRIABALIACgLIAOg4IAUhCQAvieA7h6QC8mFDmBzQDmBygcFyQgNCrg0CXIgJAZg");
	this.shape_4.setTransform(2580.9284,1938.6131);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#FB783B").s().p("EAJfAn6QAziXANiqQAclyjmhzQjmhzi8GGQg5B6gwCdIgTBDIgbgaQgYi5g3jLQiKn+j1iRQjKh4hhGdIoxo2Ig/g/Io0ngQhmhBiZi2IiFipQhxj+gbizQgnkHCThhQBOgzB5ABQA8ABAtALQCtgEECCLQBkA2BxBMIAuAfQCuB3CIB5Ik4sAQj/nvCiieQAzgyBWgJQArgFAhAFQEYgeIYIgQEMEQDUEWQlUtrgEmWQgBh/AhhBQAKgUAMgMIAKgHQCKj4C4BSQCSBBCpEPIAkA7QBoCwBmDsQA8CLAkBkQjctSCoksQAmhDA2ghQAWgNAYgIQAqgOAgAFQDRh5DzH0QDCGQDOMJQB+HaB4I6Qg2nDAGoHQAEk3AakrIAYjsQDcqyEACMQBQAsBKB5QAlA9AVA0MgAPBGKIgBCFgAf6M0QgojphFlYIgpjGQAyGgBkFng");
	this.shape_5.setTransform(2741.3721,1755.2712);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#DD6120").s().p("EAodAv+MAAQhGLQgVg0glg8QhKh6hQgsQkAiMjcKyIgZDtQgZEqgEE3QgHIGA3HEQh4o7h+nZQjPsJjCmQQjyn0jRB5QgggFgrAOQgYAIgVANQAZnsBrkgQBBiwBYhNQAsgmAfgDQDsjtC2F0QCCEKBwJjQAZCKAxEvQAlDlAQBEQAYBiARg3QASg8ASkFQA8uEFIiYQBmgwB1AhQA7ARAmAaMgAQBXfgEgBIAvnIgJhRIAaAZIgOA4gEgOiAvgQhXkoh6k0QhfjshWigIhUmHIIxI3QgUBWgPBtQgrEuABFHgAd3KbIAoDGQBGFYAoDpQhllngxmggA2xCaQAVAHAFgJQALgRg2hZQh0i8iAk/QiDlGhZlEQhillgOjyQgQkUBghPQChiFLRLFQCxCuEhEqQDFDIgJgwQgFgZgphSIhgi5QiWkohIjcQjyrlHekDQEAiLEiI1QCnFGDHJpIgjg7QiqkPiShBQi4hRiJD3IgLAIQgMALgKAVQggBAABB/QAEGWFUNrQjUkWkMkQQoYogkYAeQghgFgrAFQhXAKgyAxQiiCeD/HvIE4L/QiJh4iuh4gEgoygCBQArjoDnAnQCoAcEgC1QA7AmBpBGQkCiLisADQgtgLg9AAQh5gChNAzQiUBiAnEGQhUjSAhiwg");
	this.shape_6.setTransform(2739.5397,1693.0041);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f().s("#323232").ss(3,1,1).p("Ego+gGBMA4DAAbQg1hvh1iUQjpknk3i1QjiiDj4g8Qjsg6kDAFQiKADiNAUQokBOpqFTQiHkOkHjzQoOnmqBCHQj7A0khAwQgsAIgtAHQlVA2hgAUQjLAritBIQjDBRj8CbQm2EOh6EoQg8CVAbBeIBMABgEghzgOBQlsDphfEXEBhMAb/QiMgiiaADQhRABhUAM");
	this.shape_7.setTransform(-1535.1666,2049.1064);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#416B7D").s().p("AAEKxQBfkXFsjpQJqlSIkhOQCNgUCKgDQEDgFDsA6QD5A8DiCDQE3C0DpEnQB1CUA1BvgEg2zAKXIhMgBQgbheA8iVQB6koG2kNQD8ibDDhRQCthIDLgrQBggUFVg2QAtgHAsgIQEhgwD7g0QKBiHINHmQEHDzCHENQlsDphfEXgAHPCxIAAAAg");
	this.shape_8.setTransform(-1797.8916,1941.6314);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#FB783B").s().p("EAJfAn6QAziXANiqQAclyjmhzQjmhzi8GGQg5B6gwCdIgTBDIgbgaQgYi5g3jLQiKn+j1iRQjKh4hhGdIoxo2Ig/g/Io0ngQhmhBiZi2IiFipQhxj+gbizQgnkHCThhQBOgzB5ABQA8ABAtALQCtgEECCLQBkA2BxBMIAuAfQCuB3CIB5Ik4sAQj/nvCiieQAzgyBWgJQArgFAhAFQEYgeIYIgQEMEQDUEWQlUtrgEmWQgBh/AhhBQAKgUAMgMIAKgHQCKj4C4BSQCSBBCpEPIAkA7QBoCwBmDsQA8CLAkBkQjctSCoksQAmhDA2ghQAWgNAYgIQAqgOAgAFQDRh5DzH0QDCGQDOMJQB+HaB4I6QAyGgBkFnQgojphFlYIgpjGQg2nDAGoHQAEk3AakrIAYjsQDcqyEACMQBQAsBKB5QAlA9AVA0MgAPBGKIgBCFg");
	this.shape_9.setTransform(2741.3721,1755.2712);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#DD6120").s().p("EAodAv+MAAQhGLQgVg0glg8QhKh6hQgsQkAiMjcKyIgZDtQgZEqgEE3QgHIGA3HEIAoDGQBGFYAoDpQhllngxmgQh4o7h+nZQjPsJjCmQQjyn0jRB5QgggFgrAOQgYAIgVANQAZnsBrkgQBBiwBYhNQAsgmAfgDQDsjtC2F0QCCEKBwJjQAZCKAxEvQAlDlAQBEQAYBiARg3QASg8ASkFQA8uEFIiYQBmgwB1AhQA7ARAmAaMgAQBXfgEgBIAvnIgJhRIAaAZIgOA4gEgOiAvgQhXkoh6k0QhfjshWigIhUmHIIxI3QgUBWgPBtQgrEuABFHgA2xCaQAVAHAFgJQALgRg2hZQh0i8iAk/QiDlGhZlEQhillgOjyQgQkUBghPQChiFLRLFQCxCuEhEqQDFDIgJgwQgFgZgphSIhgi5QiWkohIjcQjyrlHekDQEAiLEiI1QCnFGDHJpIgjg7QiqkPiShBQi4hRiJD3IgLAIQgMALgKAVQggBAABB/QAEGWFUNrQjUkWkMkQQoYogkYAeQghgFgrAFQhXAKgyAxQiiCeD/HvIE4L/QiJh4iuh4gEgoygCBQArjoDnAnQCoAcEgC1QA7AmBpBGQkCiLisADQgtgLg9AAQh5gChNAzQiUBiAnEGQhUjSAhiwg");
	this.shape_10.setTransform(2739.5397,1693.0041);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape},{t:this.instance_1},{t:this.instance,p:{regX:362.1,regY:422.3,scaleX:1,scaleY:1,x:-1436.8,y:1499.75}}]},1).to({state:[]},898).to({state:[{t:this.shape_10},{t:this.shape_9},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_8},{t:this.shape_7},{t:this.instance_1},{t:this.instance,p:{regX:383.7,regY:422.4,scaleX:0.9996,scaleY:0.9996,x:-1422.7,y:1500.65}}]},117).wait(323));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_background3 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// background3
	this.instance = new lib.plants4();
	this.instance.setTransform(2820.4,1242.8,1,1,0,0,0,165.2,348.2);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#EDEED9").s().p("EmxgAiPMAAAhD0UBqnAR8BvYgJ4UBdngL/BpVAEiQKWAZZtC7UAavADCAg0AJkQXcG2YIJaQMFEtHYDWQOjEVS3BgQS2BgS3iKQS4iKLVhwQLWhwAVghUAbhgJ/BMQgNwUAmIgG4AgngE4MgAQA/fg");
	this.shape.setTransform(227.05,1780.8997);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#EDEED9").s().p("EmxgAiPMAAAhD0UBqnAR8BvYgJ4UBdngL/BpVAEiQKWAZZtC7UAavADCAg0AJkQXcG2YIJaQMFEtHYDWQOjEVS3BgQS2BgS3iKQS4iKLVhwQLWhwAVghUAbggJ/BMRgNwUAmHgG4AgogE4MgAQA/fg");
	this.shape_1.setTransform(227.05,1780.8997);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#CCFFCC").s().p("EAE4Aw6QAKhbAHhoIAFhVInWioQnXh0kTjgQjoi9g+jqQg2jKBTibQAlhGA5gmQA7gnBEADQDkAKDVHUQBqDqA9DoQCdCgEOB0QBVAkBWAcIBGAUQA5igiCmwQgoiHg2iSIguh3Qj7jhi8ouQg7ivgti6IgiiYIkZiAQu7n4AZlOQAIhpBphKQAggYAngRIAggNQDIgPHoKnQBfCDBOB2QAUApAXAlQA2BTAIAJQAHAIgkg7Qgkg6gog9QiMkpAuo5QARjLAnjXIAjitQgugGh/izQiCi3hwjbQiAj8gjitQgpjNBngvQC5hVDTJaQBpEtBFE+ICfpQQm+nMh+noQgniZgCiJIAFhqQEKjwD7EoQB9CUBJDEQDaDSjYRUQhtIqiYIAQGPxgGpjQQCFhBB4AiQAlAKAfAUQAQAJAJAIQCaDkiTDpQhoCklFDxIkMDEQiZBzhdBVQj5DnAADLQAAGFFtLUQC1FqC3EcQEgzXFolmQEwkxGQEvQCoB9ikE1QiDD3lQFgQjwD7k+EXQifCLhwBZQEKCCgtLMQgXFmhMFMQGisgGajAQCBg8BwAIQAjACAdAJIAWAJQDHCwiKDjQhuC2k/DPQjkCTk2CRQibBJhtArIiRAYQA5g8Ajkkg");
	this.shape_2.setTransform(2820.4228,1242.7769);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape},{t:this.instance}]},1).to({state:[]},898).to({state:[{t:this.shape_2},{t:this.shape_1}]},117).wait(323));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_backgroud2 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// backgroud2
	this.instance = new lib.plants2();
	this.instance.setTransform(278.2,1296.25,1,1,0,0,0,278.2,392.2);

	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#009900").ss(3,1,1).p("EACtghsIghAeQgoAogkAyQh0CfgpDIQgsDWCKHyQA2DBBCCyQA+CnAqBHQAmBBAcCvQAbCiAIDFQAFB3gDBkQgCBDgGA7QgRCfgoAkQhDA8hwGZQgJAjgKAkQggB7gdB9QgKAygLAzQgjCdgGAzEACtghsIgnASQgxAYgyAfQidBhhnB9QiRCvgQDNQgTEAC6EjIAkA2QAqBEAhBGQBnDhgkCiIgIAdQgIAkgBAmQgFB8A/BjIAFApQAFAzgFAyQgOCdhuBQIgcBCQghBUgPBfQgxExCDEpIgOGHQAAAPgBAPQgHCggIBpQAAADAAACQgKCFgJAtQgug8gahFQgKgagLgXQgJgRgJgPQgZgngOgWQg3hYg8ijQgihfg8hBQgkgohIgzQhFgxgageQgrgygLhKQgKhHhNgyQgZgRgygaQg8gfgYgOQhmg8iUghQiVgiAri+QAsi/B/jVQAridARhKQAdh+gLhzQgPiShQi/QhLi0AVjMQAIhMAXhfQACgKAniUQAxi3gPhfQgXiJiVhgIApAHQA0ALA3ARQCuA1CBBdQC2CEBDDCQBTDzhmFIIgVA+QgXBNgNBMQgpD0BMCTQAfA7ALAlQAkB0giBxIAEApQAJAzARAvQA3CUB7AxIAsA4QAzBJAnBYQB8EZgxFCIBiFGAIpiuQhMh+ghg/Qg9hygShzQgYiQAdjOQAdjBhKjAQgbhIgwhVQgFgKhNiDQhfilgKhgQgNiKB7iEATT9RIgrAHQg1ALg4ARQiyA1iEBdQi5CEhEDCQhVDzBoFIIAVA+QAXBNANBMQAqD0hNCTIgIAPATT9RIgoAVQgwAcgwAmQibB8hbC2QhiDEAGIFQACDJASC8QAQCxAWBQQAVBIgSCwQgRClgrDAQgsDEg0CHQg5CWgwAYQhXAsj0GrQhQCNhNCTQADgKACgIQAPgsAIgaQAghjAQitQAKhlAqhPQAagwA6hEQA3hCARgjQAeg8gIhLQgIhHA+hFQAVgWAqgmQA0gvATgTQBWhVAdhaQAoh4gsikQgoiUhKiKQgGgKgFgJEAAUAgYQAyg+AchJQASguAWgjQAZgnAPgWQA4hYA9ijQAjhfA9hBQAlgoBKgzQBHgxAZgeQAtgyALhKQAKhHBPgyQAZgRAzgaQA+gfAYgOQBpg8AzhOQBGhrAAipQAAibgkiYQgtidgRhKQgeh+AMhzQAPiSDMi5QDNi6g/iMQg/iMhag1Qhag0goiUQgyi3AQhfQAXiJCZhgA1C9RIAmAVQAwAcAvAmQCXB8BZC2QBgDEgFIFQgCDJgSC8QgQCxgWBQQgUBIASCwQAQClAqDAQArDEAzCHQA3CWAwAYQBVAsDvGrQBWCbBRCgQAgA/AVAtAgCfiQADgIAEgHQAuhZAKhfQAFgnAHggEgChAgXQgOAjgJAQIBmAdEgCiAgSQgBADAAACIACAAIB7ABQARgUATgiQAIAXAOAfQANAiAJAQIhiAdQAYgTAdggQALgNAMgPEgBFAhrIAGABQADgCAEgDEgBFAhrIgGABQgDgCgEgDg");
	this.shape.setTransform(-820.0659,1503.05);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#7DB453").s().p("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");
	this.shape_1.setTransform(-820.0659,1503.05);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().s("#009900").ss(3,1,1).p("EACtghsIgnASQgxAYgyAfQidBhhnB9QiRCvgQDNQgTEAC6EjIAkA2QAqBEAhBGQBnDhgkCiIgIAdQgIAkgBAmQgFB8A/BjIAFApQAFAzgFAyQgOCdhuBQIgcBCQghBUgPBfQgxExCDEpIgOGHQAAAPgBAPQgHCggIBpQAAADAAACQgKCFgJAtQgBADAAACIACAAQgOAjgJAQIBmAdEACtghsIghAeQgoAogkAyQh0CfgpDIQgsDWCKHyQA2DBBCCyQA+CnAqBHQAmBBAcCvQAbCiAIDFQAFB3gDBkQgCBDgGA7QgRCfgoAkQhDA8hwGZQgJAjgKAkQggB7gdB9QgKAygLAzQgjCdgGAzAIpiuQhMh+ghg/Qg9hygShzQgYiQAdjOQAdjBhKjAQgbhIgwhVQgFgKhNiDQhfilgKhgQgNiKB7iEATT9RIgrAHQg1ALg4ARQiyA1iEBdQi5CEhEDCQhVDzBoFIIAVA+QAXBNANBMQAqD0hNCTIgIAPATT9RIgoAVQgwAcgwAmQibB8hbC2QhiDEAGIFQACDJASC8QAQCxAWBQQAVBIgSCwQgRClgrDAQgsDEg0CHQg5CWgwAYQhXAsj0GrQhQCNhNCTQADgKACgIQAPgsAIgaQAghjAQitQAKhlAqhPQAagwA6hEQA3hCARgjQAeg8gIhLQgIhHA+hFQAVgWAqgmQA0gvATgTQBWhVAdhaQAoh4gsikQgoiUhKiKQgGgKgFgJEAAUAgYQAyg+AchJQASguAWgjQAZgnAPgWQA4hYA9ijQAjhfA9hBQAlgoBKgzQBHgxAZgeQAtgyALhKQAKhHBPgyQAZgRAzgaQA+gfAYgOQBpg8AzhOQBGhrAAipQAAibgkiYQgtidgRhKQgeh+AMhzQAPiSDMi5QDNi6g/iMQg/iMhag1Qhag0goiUQgyi3AQhfQAXiJCZhgA1C9RIAmAVQAwAcAvAmQCXB8BZC2QBgDEgFIFQgCDJgSC8QgQCxgWBQQgUBIASCwQAQClAqDAQArDEAzCHQA3CWAwAYQBVAsDvGrQBWCbBRCgQAgA/AVAtA1C9RIApAHQA0ALA3ARQCuA1CBBdQC2CEBDDCQBTDzhmFIIgVA+QgXBNgNBMQgpD0BMCTQAfA7ALAlQAkB0giBxIAEApQAJAzARAvQA3CUB7AxIAsA4QAzBJAnBYQB8EZgxFCIBiFGEgCiAgSQgug8gahFQgKgagLgXQgJgRgJgPQgZgngOgWQg3hYg8ijQgihfg8hBQgkgohIgzQhFgxgageQgrgygLhKQgKhHhNgyQgZgRgygaQg8gfgYgOQhmg8iUghQiVgiAri+QAsi/B/jVQAridARhKQAdh+gLhzQgPiShQi/QhLi0AVjMQAIhMAXhfQACgKAniUQAxi3gPhfQgXiJiVhgAgCfiQADgIAEgHQAuhZAKhfQAFgnAHggEAAUAgYQANAiAJAQIhiAdQAYgTAdggQALgNAMgPgEgBFAhrIAGABQADgCAEgDEgBFAhrIgGABQgDgCgEgDgEgChAgXIB7ABQARgUATgiQAIAXAOAf");
	this.shape_2.setTransform(-820.0659,1503.05);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#7DB453").s().p("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");
	this.shape_3.setTransform(-820.0659,1503.05);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#CCFFCC").s().p("EAE4Aw6QAKhbAHhoIAFhVInWioQnXh0kTjgQjoi9g+jqQg2jKBTibQAlhGA5gmQA7gnBEADQDkAKDVHUQBqDqA9DoQCdCgEOB0QBVAkBWAcIBGAUQA5igiCmwQgoiHg2iSIguh3Qj7jhi8ouQg7ivgti6IgiiYIkZiAQu7n4AZlOQAIhpBphKQAggYAngRIAggNQDIgPHoKnQBfCDBOB2QiMkpAuo5QARjLAnjXIAjitQgugGh/izQiCi3hwjbQiAj8gjitQgpjNBngvQC5hVDTJaQBpEtBFE+ICfpQQm+nMh+noQgniZgCiJIAFhqQEKjwD7EoQB9CUBJDEQDaDSjYRUQhtIqiYIAQGPxgGpjQQCFhBB4AiQAlAKAfAUQAQAJAJAIQCaDkiTDpQhoCklFDxIkMDEQiZBzhdBVQj5DnAADLQAAGFFtLUQC1FqC3EcQEgzXFolmIASgSQEqkWGEEmQCoB9ikE1QghA+guBEQiIDNj8EIQiqCyjSDAQhWBPhcBRIhhBTQhiBUhMA9QEKCCgtLMQgXFmhMFMQGUsFGMjOIAcgNQCBg8BwAIQAjACAdAJIAWAJQCIB4gWCRQgKBCgrBIQhuC2k/DPQjkCTk2CRQibBJhtArIiRAYQA5g8AjkkgAoTDiQA2BTAIAJQAHAIgkg7Qgkg6gog9QAUApAXAlg");
	this.shape_4.setTransform(165.2187,1340.2269);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#04C2F6").s().p("EgF/A2CQg+gYhNgfQAWiRiIh4IgWgJQgdgJgjgCQhwgIiBA8IgcANQh/hChthDQlQjPh0i2Qg8heAAhWIBhhTQBchRBWhPQBcAHBlAtQGwDAG4MgQhQlMgYlmQgwrMEYiCQh1hZioiLIiMh3QAuhEAhg+QCkk1ioh+QmEkmkqEWQjgj0hoi5Qisk1Cwh9QGlkvFBExQF6FmEwTXQDAkcC/lqQGArUAAmFQAAjLkHjnQhhhViihzIkZjEQlWjxhuikQibjpCjjkQAJgIAQgJQAhgUAogKQB+giCMBBQG/DQGkRgQigoAhyoqQjkxUDmjSQBMjECEiUQEIkoEYDwIAGBqQgDCJgpCZQiEHonWHMICoJQQBIk+BvktQDepaDDBVQBsAvgsDNQgkCtiHD8Qh2DbiIC3QiGCzgxAGIAlCtQApDXASDLQAxI5iUEpQBSh2BkiDQICqnDTAPIAhANQApARAiAYQBvBKAIBpQAaFOvtH4IkoCAIgkCYQgvC6g+CvQjGIukIDhIgxB3Qg5CSgqCHQiIGwA8CgIBJgUQBagcBagkQEdh0CligQBAjoBwjqQDgnUDwgKQBHgDA+AnQA8AmAnBGQBYCbg5DKQhCDqjzC9QkiDgnwB0InvCoIAFBVQAIBoALBbQAkEkA8A8gAINELQgmA7AIgIQAIgJA5hTQAYglAVgpQgqA9gmA6g");
	this.shape_5.setTransform(382.4074,1252.2269);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_1},{t:this.shape},{t:this.instance}]},1).to({state:[]},898).to({state:[{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2}]},117).wait(323));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.sad_talk = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// mouth
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("EguQgGjQkXgLhYguQjEhpCFkxIBqiqQCKjKCcicQHVnVIYCHQAFACAGABIBVBAQCBBiCBA5QCsBKEJhlQCEgyBhhBQABAAAAgBQCDC0B0BIQH8C9IsiGIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIABAAIB4AAQBYAdBXAiIAAAAQBgAlBcArQAZALAYAMQCHBAB2BJIABAAQCHBSBxBdQCsCNB1CkQBBm4CZl5QB0kiCHiDQDYjTEHDDIBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QpuS/1JjFQiNAHjagjQm3hGmIjTQxzpnlx4hQghiNgbiUQgCgOgDgOQASAAATAAQFJADEmAjQKIBME0DKQCJBbBYCMQh+BEgIA+AbAoqQhHgyhegwQg3gdg/gHQgegEggACQhkACiDALQgVACgUADQjnAYiDA9QgYALhHAxQg+AsgYAUQhaBOgpBOQgIANgJBFQgLBWASAlQAxBjChBSQA0AbBAAZQAVAHCJAbQCPAcAmACQAxADAwgCQCqgDCEgqQCDg1Beg2QDpiIgDiYQgDifjXiXgALxCDIFTBAIATtjAWUCDIARszAa0AsIAMpWALtpLIAELOAuRArQhRAZhTAnQgWALgUAK");
	this.shape.setTransform(344.461,241.8604);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FF99FF").s().p("AhYG6IATtjIgTNjIlThAIgErNIAELNQhAgZg0gbQihhTgxhjQgSglALhWQAJhDAIgNQAphOBahOQAYgVA+grQBHgyAYgKQCDg+DngYQAUgDAVgBQCCgMBkgCQAggBAeADQA/AHA3AdQBeAxBHAyQDXCWADCfQADCXjpCJIAMpVIgMJVQheA3iDA0QiEAriqADIgfAAQggAAghgCgAD3F6IARszgAIXEjg");
	this.shape_1.setTransform(462.5815,217.1275);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FFCCFF").s().p("EgDFAlXQiNAHjagjQm3hGmIjTQxzpnlx4hQghiNgbiUIgFgcIAlAAQFJADEmAjQKIBME0DKQCJBbBYCMQh+BEgIA+QAIg+B+hEQhYiMiJhbQk0jKqIhMQkmgjlJgDIglAAQkXgLhYguQjEhpCFkxIBqiqQCKjKCcicQHVnVIYCHIALADIBVBAQCBBiCBA5QCsBKEJhlQCEgyBhhBIABgBQCDC0B0BIQH8C9IsiGIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIABAAIB4AAQBYAdBXAiIAAAAQBgAlBcArIAxAXQCHBAB2BJIABAAQCHBSBxBdQCsCNB1CkQBBm4CZl5QB0kiCHiDQDYjTEHDDIBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QoXQWw2AAQitAAi9gcgAVnqyQhkACiDALQgVACgUADQjnAYiDA9QgYALhHAxQg+AsgYAUQhaBOgpBOQgIANgJBFQgLBWASAlQAxBjChBSQA0AbBAAZQAVAHCJAbQCPAcAmACQAxADAwgCQCqgDCEgqQCDg1Beg2QDpiIgDiYQgDifjXiXQhHgyhegwQg3gdg/gHQgVgDgWAAIgTABgAw1BrIgqAVIAqgVQBTgnBRgZQhRAZhTAng");
	this.shape_2.setTransform(344.461,241.8604);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("AxfCAQhYiMiJhbQk0jKqIhMQkmgjlJgDQgTAAgSAAQkXgLhYguQjEhpCFkxIBqiqQCKjKCcicQHVnVIYCHQAFACAGABIBVBAQCBBiCBA5QCsBKEJhlQCEgyBhhBQABAAAAgBQCDC0B0BIQH8C9IsiGIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIABAAIB4AAQBYAdBXAiIAAAAQBgAlBcArQAZALAYAMQCHBAB2BJIABAAQCHBSBxBdQCsCNB1CkQBBm4CZl5QB0kiCHiDQDYjTEHDDIBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QpuS/1JjFQiNAHjagjQm3hGmIjTQxzpnlx4hQgYhqgWhuIceG+Qh+BEgIA+AbAoqQhHgyhegwQg3gdg/gHQgegEggACQhkACiDALQgVACgUADQjnAYiDA9QgYALhHAxQg+AsgYAUQhaBOgpBOQgIANgJBFQgLBWASAlQAxBjChBSQA0AbBAAZQAVAHCJAbQCPAcAmACQAxADAwgCQCqgDCEgqQCDg1Beg2QDpiIgDiYQgDifjXiXgALxCDIFTBAIATtjAWUCDIARszAa0AsIAMpWALtpLIAELOAuRArQhRAZhTAnQgWALgUAK");
	this.shape_3.setTransform(344.461,241.8604);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#FFCCFF").s().p("EgDFAlXQiNAHjagjQm3hGmIjTQxzpnlx4hQgYhqgWhuIceG+Qh+BEgIA+QAIg+B+hEQhYiMiJhbQk0jKqIhMQkmgjlJgDIglAAQkXgLhYguQjEhpCFkxIBqiqQCKjKCcicQHVnVIYCHIALADIBVBAQCBBiCBA5QCsBKEJhlQCEgyBhhBIABgBQCDC0B0BIQH8C9IsiGIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIABAAIB4AAQBYAdBXAiIAAAAQBgAlBcArIAxAXQCHBAB2BJIABAAQCHBSBxBdQCsCNB1CkQBBm4CZl5QB0kiCHiDQDYjTEHDDIBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QoXQWw2AAQitAAi9gcgAVnqyQhkACiDALQgVACgUADQjnAYiDA9QgYALhHAxQg+AsgYAUQhaBOgpBOQgIANgJBFQgLBWASAlQAxBjChBSQA0AbBAAZQAVAHCJAbQCPAcAmACQAxADAwgCQCqgDCEgqQCDg1Beg2QDpiIgDiYQgDifjXiXQhHgyhegwQg3gdg/gHQgVgDgWAAIgTABgAw1BrIgqAVIAqgVQBTgnBRgZQhRAZhTAng");
	this.shape_4.setTransform(344.461,241.8604);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("AxfCAQhYiMiJhbQk0jKqIhMQkmgjlJgDQgTAAgSAAQkXgLhYguQjEhpCFkxIBqiqQCKjKCcicQHVnVIYCHQAFACAGABIBVBAQCBBiCBA5QCsBKEJhlQCEgyBhhBQABAAAAgBQCDC0B0BIQH8C9IsiGIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIABAAIB4AAQBYAdBXAiIAAAAQBgAlBcArQAZALAYAMQCHBAB2BJIABAAQCHBSBxBdQCsCNB1CkQBBm4CZl5QB0kiCHiDQDYjTEHDDIBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QpuS/1JjFQiNAHjagjQm3hGmIjTQxJpQl+3HIbTB1Qh+BEgIA+AbAoqQhHgyhegwQg3gdg/gHQgegEggACQhkACiDALQgVACgUADQjnAYiDA9QgYALhHAxQg+AsgYAUQhaBOgpBOQgIANgJBFQgLBWASAlQAxBjChBSQA0AbBAAZQAVAHCJAbQCPAcAmACQAxADAwgCQCqgDCEgqQCDg1Beg2QDpiIgDiYQgDifjXiXgALxCDIFTBAIATtjALtpLIAELOAa0AsIAMpWAWUCDIARszAuRArQhRAZhTAnQgWALgUAK");
	this.shape_5.setTransform(344.461,241.8604);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#FF99FF").s().p("AhYG6IATtjIgTNjIlThAIgErNQCDg+DngYQAUgDAVgBQCCgMBkgCQAggBAeADIgRMzIARszQA/AHA3AdQBeAxBHAyQDXCWADCfQADCXjpCJIAMpVIgMJVQheA3iDA0QiEAriqADIgfAAQggAAghgCgAofFGQihhTgxhjQgSglALhWQAJhDAIgNQAphOBahOQAYgVA+grQBHgyAYgKIAELNQhAgZg0gbgAIXEjg");
	this.shape_6.setTransform(462.5815,217.1275);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#FFCCFF").s().p("EgDFAlXQiNAHjagjQm3hGmIjTQxJpQl+3HIbTB1Qh+BEgIA+QAIg+B+hEQhYiMiJhbQk0jKqIhMQkmgjlJgDIglAAQkXgLhYguQjEhpCFkxIBqiqQCKjKCcicQHVnVIYCHIALADIBVBAQCBBiCBA5QCsBKEJhlQCEgyBhhBIABgBQCDC0B0BIQH8C9IsiGIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIABAAIB4AAQBYAdBXAiIAAAAQBgAlBcArIAxAXQCHBAB2BJIABAAQCHBSBxBdQCsCNB1CkQBBm4CZl5QB0kiCHiDQDYjTEHDDIBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QoXQWw2AAQitAAi9gcgAVnqyQhkACiDALQgVACgUADQjnAYiDA9QgYALhHAxQg+AsgYAUQhaBOgpBOQgIANgJBFQgLBWASAlQAxBjChBSQA0AbBAAZQAVAHCJAbQCPAcAmACQAxADAwgCQCqgDCEgqQCDg1Beg2QDpiIgDiYQgDifjXiXQhHgyhegwQg3gdg/gHQgVgDgWAAIgTABgAw1BrIgqAVIAqgVQBTgnBRgZQhRAZhTAng");
	this.shape_7.setTransform(344.461,241.8604);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("AxfCAQhYiMiJhbQk0jKqIhMQkmgjlJgDQgTAAgSAAQkXgLhYguQjEhpCFkxIBqiqQCKjKCcicQHVnVIYCHQAFACAGABIBVBAQCBBiCBA5QCsBKEJhlQCEgyBhhBQABAAAAgBQCDC0B0BIQH8C9IsiGIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIABAAIB4AAQBYAdBXAiIAAAAQBgAlBcArQAZALAYAMQCHBAB2BJIABAAQCHBSBxBdQCsCNB1CkQBBm4CZl5QB0kiCHiDQDYjTEHDDIBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QpuS/1JjFQiNAHjagjQm3hGmIjTQuwn+mfyOIZbkWQh+BEgIA+AbAoqQhHgyhegwQg3gdg/gHQgegEggACQhkACiDALQgVACgUADQjnAYiDA9QgYALhHAxQg+AsgYAUQhaBOgpBOQgIANgJBFQgLBWASAlQAxBjChBSQA0AbBAAZQAVAHCJAbQCPAcAmACQAxADAwgCQCqgDCEgqQCDg1Beg2QDpiIgDiYQgDifjXiXgALxCDIFTBAIATtjALtpLIAELOAa0AsIAMpWAWUCDIARszAuRArQhRAZhTAnQgWALgUAK");
	this.shape_8.setTransform(344.461,241.8604);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#FFCCFF").s().p("EgDFAlXQiNAHjagjQm3hGmIjTQuwn+mfyOIZbkWQh+BEgIA+QAIg+B+hEQhYiMiJhbQk0jKqIhMQkmgjlJgDIglAAQkXgLhYguQjEhpCFkxIBqiqQCKjKCcicQHVnVIYCHIALADIBVBAQCBBiCBA5QCsBKEJhlQCEgyBhhBIABgBQCDC0B0BIQH8C9IsiGIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIABAAIB4AAQBYAdBXAiIAAAAQBgAlBcArIAxAXQCHBAB2BJIABAAQCHBSBxBdQCsCNB1CkQBBm4CZl5QB0kiCHiDQDYjTEHDDIBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QoXQWw2AAQitAAi9gcgAVnqyQhkACiDALQgVACgUADQjnAYiDA9QgYALhHAxQg+AsgYAUQhaBOgpBOQgIANgJBFQgLBWASAlQAxBjChBSQA0AbBAAZQAVAHCJAbQCPAcAmACQAxADAwgCQCqgDCEgqQCDg1Beg2QDpiIgDiYQgDifjXiXQhHgyhegwQg3gdg/gHQgVgDgWAAIgTABgAw1BrIgqAVIAqgVQBTgnBRgZQhRAZhTAng");
	this.shape_9.setTransform(344.461,241.8604);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("AxfCAQhYiMiJhbQk0jKqIhMQkmgjlJgDQgTAAgSAAQkXgLhYguQjEhpCFkxIBqiqQCKjKCcicQHVnVIYCHQAFACAGABIBVBAQCBBiCBA5QCsBKEJhlQCEgyBhhBQABAAAAgBQCDC0B0BIQH8C9IsiGIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIABAAIB4AAQBYAdBXAiIAAAAQBgAlBcArQAZALAYAMQCHBAB2BJIABAAQCHBSBxBdQCsCNB1CkQBBm4CZl5QB0kiCHiDQDYjTEHDDIBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QpuS/1JjFQiNAHjagjQm3hGmIjTQxJpQl+3HgAbAoqQhHgyhegwQg3gdg/gHQgegEggACQhkACiDALQgVACgUADQjnAYiDA9QgYALhHAxQg+AsgYAUQhaBOgpBOQgIANgJBFQgLBWASAlQAxBjChBSQA0AbBAAZQAVAHCJAbQCPAcAmACQAxADAwgCQCqgDCEgqQCDg1Beg2QDpiIgDiYQgDifjXiXgALxCDIFTBAIATtjAWUCDIARszAa0AsIAMpWALtpLIAELOAuRArQhRAZhTAnQgWALgUAKQh+BEgIA+");
	this.shape_10.setTransform(344.461,241.8604);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#FFCCFF").s().p("EgDFAlXQiNAHjagjQm3hGmIjTQxJpQl+3HIbTB1QhYiMiJhbQk0jKqIhMQkmgjlJgDIglAAQkXgLhYguQjEhpCFkxIBqiqQCKjKCcicQHVnVIYCHIALADIBVBAQCBBiCBA5QCsBKEJhlQCEgyBhhBIABgBQCDC0B0BIQH8C9IsiGIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIABAAIB4AAQBYAdBXAiIAAAAQBgAlBcArIAxAXQCHBAB2BJIABAAQCHBSBxBdQCsCNB1CkQBBm4CZl5QB0kiCHiDQDYjTEHDDIBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QoXQWw2AAQitAAi9gcgAw1BrIgqAVQh+BEgIA+QAIg+B+hEIAqgVQBTgnBRgZQhRAZhTAngAVnqyQhkACiDALQgVACgUADQjnAYiDA9QgYALhHAxQg+AsgYAUQhaBOgpBOQgIANgJBFQgLBWASAlQAxBjChBSQA0AbBAAZQAVAHCJAbQCPAcAmACQAxADAwgCQCqgDCEgqQCDg1Beg2QDpiIgDiYQgDifjXiXQhHgyhegwQg3gdg/gHQgVgDgWAAIgTABg");
	this.shape_11.setTransform(344.461,241.8604);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("AxfCAQhYiMiJhbQk0jKqIhMQkmgjlJgDQgTAAgSAAQkXgLhYguQjEhpCFkxIBqiqQCKjKCcicQHVnVIYCHQAFACAGABIBVBAQCBBiCBA5QCsBKEJhlQCEgyBhhBQABAAAAgBQCDC0B0BIQH8C9IsiGIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIABAAIB4AAQBYAdBXAiIAAAAQBgAlBcArQAZALAYAMQCHBAB2BJIABAAQCHBSBxBdQCsCNB1CkQBBm4CZl5QB0kiCHiDQDYjTEHDDIBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QpuS/1JjFQiNAHjagjQm3hGmIjTQxzpnlx4hQgYhqgWhugAbAoqQhHgyhegwQg3gdg/gHQgegEggACQhkACiDALQgVACgUADQjnAYiDA9QgYALhHAxQg+AsgYAUQhaBOgpBOQgIANgJBFQgLBWASAlQAxBjChBSQA0AbBAAZQAVAHCJAbQCPAcAmACQAxADAwgCQCqgDCEgqQCDg1Beg2QDpiIgDiYQgDifjXiXgALxCDIFTBAIATtjALtpLIAELOAa0AsIAMpWAWUCDIARszAuRArQhRAZhTAnQgWALgUAKQh+BEgIA+");
	this.shape_12.setTransform(344.461,241.8604);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#FFCCFF").s().p("EgDFAlXQiNAHjagjQm3hGmIjTQxzpnlx4hQgYhqgWhuIceG+QhYiMiJhbQk0jKqIhMQkmgjlJgDIglAAQkXgLhYguQjEhpCFkxIBqiqQCKjKCcicQHVnVIYCHIALADIBVBAQCBBiCBA5QCsBKEJhlQCEgyBhhBIABgBQCDC0B0BIQH8C9IsiGIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIABAAIB4AAQBYAdBXAiIAAAAQBgAlBcArIAxAXQCHBAB2BJIABAAQCHBSBxBdQCsCNB1CkQBBm4CZl5QB0kiCHiDQDYjTEHDDIBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QoXQWw2AAQitAAi9gcgAw1BrIgqAVQh+BEgIA+QAIg+B+hEIAqgVQBTgnBRgZQhRAZhTAngAVnqyQhkACiDALQgVACgUADQjnAYiDA9QgYALhHAxQg+AsgYAUQhaBOgpBOQgIANgJBFQgLBWASAlQAxBjChBSQA0AbBAAZQAVAHCJAbQCPAcAmACQAxADAwgCQCqgDCEgqQCDg1Beg2QDpiIgDiYQgDifjXiXQhHgyhegwQg3gdg/gHQgVgDgWAAIgTABg");
	this.shape_13.setTransform(344.461,241.8604);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("EguQgGjQkXgLhYguQjEhpCFkxIBqiqQCKjKCcicQHVnVIYCHQAFACAGABIBVBAQCBBiCBA5QCsBKEJhlQCEgyBhhBQABAAAAgBQCDC0B0BIQH8C9IsiGIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIABAAIB4AAQBYAdBXAiIAAAAQBgAlBcArQAZALAYAMQCHBAB2BJIABAAQCHBSBxBdQCsCNB1CkQBBm4CZl5QB0kiCHiDQDYjTEHDDIBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QpuS/1JjFQiNAHjagjQm3hGmIjTQxzpnlx4hQghiNgbiUQgCgOgDgOQASAAATAAQFJADEmAjQKIBME0DKQCJBbBYCMAbAoqQhHgyhegwQg3gdg/gHQgegEggACQhkACiDALQgVACgUADQjnAYiDA9QgYALhHAxQg+AsgYAUQhaBOgpBOQgIANgJBFQgLBWASAlQAxBjChBSQA0AbBAAZQAVAHCJAbQCPAcAmACQAxADAwgCQCqgDCEgqQCDg1Beg2QDpiIgDiYQgDifjXiXgALxCDIFTBAIATtjALtpLIAELOAa0AsIAMpWAWUCDIARszAuRArQhRAZhTAnQgWALgUAKQh+BEgIA+");
	this.shape_14.setTransform(344.461,241.8604);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#FFCCFF").s().p("EgDFAlXQiNAHjagjQm3hGmIjTQxzpnlx4hQghiNgbiUIgFgcIAlAAQFJADEmAjQKIBME0DKQCJBbBYCMQhYiMiJhbQk0jKqIhMQkmgjlJgDIglAAQkXgLhYguQjEhpCFkxIBqiqQCKjKCcicQHVnVIYCHIALADIBVBAQCBBiCBA5QCsBKEJhlQCEgyBhhBIABgBQCDC0B0BIQH8C9IsiGIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIABAAIB4AAQBYAdBXAiIAAAAQBgAlBcArIAxAXQCHBAB2BJIABAAQCHBSBxBdQCsCNB1CkQBBm4CZl5QB0kiCHiDQDYjTEHDDIBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QoXQWw2AAQitAAi9gcgAw1BrIgqAVQh+BEgIA+QAIg+B+hEIAqgVQBTgnBRgZQhRAZhTAngAVnqyQhkACiDALQgVACgUADQjnAYiDA9QgYALhHAxQg+AsgYAUQhaBOgpBOQgIANgJBFQgLBWASAlQAxBjChBSQA0AbBAAZQAVAHCJAbQCPAcAmACQAxADAwgCQCqgDCEgqQCDg1Beg2QDpiIgDiYQgDifjXiXQhHgyhegwQg3gdg/gHQgVgDgWAAIgTABg");
	this.shape_15.setTransform(344.461,241.8604);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_4},{t:this.shape_1},{t:this.shape_3}]},3).to({state:[{t:this.shape_7},{t:this.shape_6},{t:this.shape_5}]},3).to({state:[{t:this.shape_9},{t:this.shape_6},{t:this.shape_8}]},3).to({state:[{t:this.shape_11},{t:this.shape_1},{t:this.shape_10}]},3).to({state:[{t:this.shape_13},{t:this.shape_6},{t:this.shape_12}]},3).to({state:[{t:this.shape_15},{t:this.shape_6},{t:this.shape_14}]},3).wait(3));

	// eyes
	this.instance = new lib.sad_Eyes();
	this.instance.setTransform(261,-39.7,1,1,0,0,0,189,147.7);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(21));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1.5,-188.9,691.9,674.2);


(lib.sad_silent = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.sad_Eyes();
	this.instance.setTransform(261.1,-39.75,1,1,0,0,0,189,147.7);

	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("EguQgGjQkXgLhYguQjEhpCFkxIBqiqQCKjKCcicQHVnVIYCHQAFACAGABIBVBAQCBBiCBA5QCsBKEJhlQCEgyBhhBQABAAAAgBQCDC0B0BIQH8C9IsiGIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIABAAIB4AAQBYAdBXAiIAAAAQBgAlBcArQAZALAYAMQCHBAB2BJIABAAQCHBSBxBdQCsCNB1CkQBBm4CZl5QB0kiCHiDQDYjTEHDDIBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QpuS/1JjFQiNAHjagjQm3hGmIjTQxzpnlx4hQghiNgbiUQgCgOgDgOQASAAATAAQFJADEmAjQKIBME0DKQCJBbBYCMQh+BEgIA+AbAoqQhHgyhegwQg3gdg/gHQgegEggACQhkACiDALQgVACgUADQjnAYiDA9QgYALhHAxQg+AsgYAUQhaBOgpBOQgIANgJBFQgLBWASAlQAxBjChBSQA0AbBAAZQAVAHCJAbQCPAcAmACQAxADAwgCQCqgDCEgqQCDg1Beg2QDpiIgDiYQgDifjXiXgALxCDIFTBAIATtjALtpLIAELOAa0AsIAMpWAWUCDIARszAuRArQhRAZhTAnQgWALgUAK");
	this.shape.setTransform(344.461,241.8604);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FF99FF").s().p("AhYG6IATtjIgTNjIlThAIgErNQCDg+DngYQAUgDAVgBQCCgMBkgCQAggBAeADIgRMzIARszQA/AHA3AdQBeAxBHAyQDXCWADCfQADCXjpCJIAMpVIgMJVQheA3iDA0QiEAriqADIgfAAQggAAghgCgAofFGQihhTgxhjQgSglALhWQAJhDAIgNQAphOBahOQAYgVA+grQBHgyAYgKIAELNQhAgZg0gbgAIXEjg");
	this.shape_1.setTransform(462.5815,217.1275);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FFCCFF").s().p("EgDFAlXQiNAHjagjQm3hGmIjTQxzpnlx4hQghiNgbiUIgFgcIAlAAQFJADEmAjQKIBME0DKQCJBbBYCMQh+BEgIA+QAIg+B+hEQhYiMiJhbQk0jKqIhMQkmgjlJgDIglAAQkXgLhYguQjEhpCFkxIBqiqQCKjKCcicQHVnVIYCHIALADIBVBAQCBBiCBA5QCsBKEJhlQCEgyBhhBIABgBQCDC0B0BIQH8C9IsiGIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIABAAIB4AAQBYAdBXAiIAAAAQBgAlBcArIAxAXQCHBAB2BJIABAAQCHBSBxBdQCsCNB1CkQBBm4CZl5QB0kiCHiDQDYjTEHDDIBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QoXQWw2AAQitAAi9gcgAVnqyQhkACiDALQgVACgUADQjnAYiDA9QgYALhHAxQg+AsgYAUQhaBOgpBOQgIANgJBFQgLBWASAlQAxBjChBSQA0AbBAAZQAVAHCJAbQCPAcAmACQAxADAwgCQCqgDCEgqQCDg1Beg2QDpiIgDiYQgDifjXiXQhHgyhegwQg3gdg/gHQgVgDgWAAIgTABgAw1BrIgqAVIAqgVQBTgnBRgZQhRAZhTAng");
	this.shape_2.setTransform(344.461,241.8604);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FF99FF").s().p("AhYG6IATtjIgTNjIlThAIgErNQCDg+DngYQAUgDAVgBQCCgMBkgCQAggBAeADIgRMzIARszQA/AHA3AdQBeAxBHAyQDXCWADCfQADCXjpCJIAMpVIgMJVQheA3iDA0QiEAriqADIgfAAQghAAgggCgAofFGQihhTgxhjQgSglALhWQAJhDAIgNQAphOBahOQAYgVA+grQBHgyAYgKIAELNQhAgZg0gbgAIXEjg");
	this.shape_3.setTransform(462.5815,215.0275);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("EguQgGjQkXgLhYguQjEhpCFkxIBqiqQCKjKCcicQHVnVIYCHQAFACAGABIBVBAQCBBiCBA5QCsBKEJhlQCEgyBhhBQABAAAAgBQCDC0B0BIQH8C9IsiGIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIABAAIB4AAQBYAdBXAiIAAAAQBgAlBcArQAZALAYAMQCHBAB2BJIABAAQCHBSBxBdQCsCNB1CkQBBm4CZl5QB0kiCHiDQDYjTEHDDIBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QpuS/1JjFQiNAHjagjQm3hGmIjTQxzpnlx4hQghiNgbiUQgCgOgDgOQASAAATAAQFJADEmAjQKIBME0DKQCJBbBYCMAbAoqQhHgyhegwQg3gdg/gHQgegEggACQhkACiDALQgVACgUADQjnAYiDA9QgYALhHAxQg+AsgYAUQhaBOgpBOQgIANgJBFQgLBWASAlQAxBjChBSQA0AbBAAZQAVAHCJAbQCPAcAmACQAxADAwgCQCqgDCEgqQCDg1Beg2QDpiIgDiYQgDifjXiXgALxCDIFTBAIATtjAWUCDIARszAa0AsIAMpWALtpLIAELOAuRArQhRAZhTAnQgWALgUAKQh+BEgIA+");
	this.shape_4.setTransform(344.461,237.6604);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#FF99FF").s().p("AhYG6IATtjIgTNjIlThAIgErNIAELNQhAgZg0gbQihhTgxhjQgSglALhWQAJhDAIgNQAphOBahOQAYgVA+grQBHgyAYgKQCDg+DngYQAUgDAVgBQCCgMBkgCQAggBAeADQA/AHA3AdQBeAxBHAyQDXCWADCfQADCXjpCJIAMpVIgMJVQheA3iDA0QiEAriqADIgfAAQggAAghgCgAD3F6IARszgAIXEjg");
	this.shape_5.setTransform(462.5815,212.9275);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#FFCCFF").s().p("EgDFAlXQiNAHjagjQm3hGmIjTQxzpnlx4hQghiNgbiUIgFgcIAlAAQFJADEmAjQKIBME0DKQCJBbBYCMQhYiMiJhbQk0jKqIhMQkmgjlJgDIglAAQkXgLhYguQjEhpCFkxIBqiqQCKjKCcicQHVnVIYCHIALADIBVBAQCBBiCBA5QCsBKEJhlQCEgyBhhBIABgBQCDC0B0BIQH8C9IsiGIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIABAAIB4AAQBYAdBXAiIAAAAQBgAlBcArIAxAXQCHBAB2BJIABAAQCHBSBxBdQCsCNB1CkQBBm4CZl5QB0kiCHiDQDYjTEHDDIBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QoXQWw2AAQitAAi9gcgAw1BrIgqAVQh+BEgIA+QAIg+B+hEIAqgVQBTgnBRgZQhRAZhTAngAVnqyQhkACiDALQgVACgUADQjnAYiDA9QgYALhHAxQg+AsgYAUQhaBOgpBOQgIANgJBFQgLBWASAlQAxBjChBSQA0AbBAAZQAVAHCJAbQCPAcAmACQAxADAwgCQCqgDCEgqQCDg1Beg2QDpiIgDiYQgDifjXiXQhHgyhegwQg3gdg/gHQgVgDgWAAIgTABg");
	this.shape_6.setTransform(344.461,237.6604);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("EguQgGjQkXgLhYguQjEhpCFkxIBqiqQCKjKCcicQHVnVIYCHQAFACAGABIBVBAQCBBiCBA5QCsBKEJhlQCEgyBhhBQABAAAAgBQCDC0B0BIQH8C9IsiGIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIABAAIB4AAQBYAdBXAiIAAAAQBgAlBcArQAZALAYAMQCHBAB2BJIABAAQCHBSBxBdQCsCNB1CkQBBm4CZl5QB0kiCHiDQDYjTEHDDIBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QpuS/1JjFQiNAHjagjQm3hGmIjTQxzpnlx4hQghiNgbiUQgCgOgDgOQASAAATAAQFJADEmAjQKIBME0DKQCJBbBYCMAbAoqQhHgyhegwQg3gdg/gHQgegEggACQhkACiDALQgVACgUADQjnAYiDA9QgYALhHAxQg+AsgYAUQhaBOgpBOQgIANgJBFQgLBWASAlQAxBjChBSQA0AbBAAZIFTBAQAxADAwgCQCqgDCEgqQCDg1Beg2QDpiIgDiYQgDifjXiXgALxCDQAVAHCJAbQCPAcAmACIATtjAWUCDIARszAa0AsIAMpWALtpLIAELOAuRArQhRAZhTAnQgWALgUAKQh+BEgIA+");
	this.shape_7.setTransform(344.461,233.4604);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#FF99FF").s().p("AhYG6IATtjQAUgDAVgBQCCgMBkgCQAggBAeADQA/AHA3AdQBeAxBHAyIgMJVQheA3iDA0QiEAriqADIgfAAQghAAgggCgAD3F6IARszgAmrF6IgErNIAELNQhAgZg0gbQihhTgxhjQgSglALhWQAJhDAIgNQAphOBahOQAYgVA+grQBHgyAYgKQCDg+DngYIgTNjgAIXEjgAIjkyQDXCWADCfQADCXjpCJgAhFmpg");
	this.shape_8.setTransform(462.5815,208.7275);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#FF99FF").s().p("AhYG6IATtjQAUgDAVgBQCCgMBkgCQAggBAeADQA/AHA3AdQBeAxBHAyIgMJVQheA3iDA0QiEAriqADIgfAAQggAAghgCgAD3F6IARszgAmrF6IgErNIAELNQhAgZg0gbQihhTgxhjQgSglALhWQAJhDAIgNQAphOBahOQAYgVA+grQBHgyAYgKQCDg+DngYIgTNjgAIXEjgAIjkyQDXCWADCfQADCXjpCJgAhFmpg");
	this.shape_9.setTransform(462.5815,206.6275);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("EguQgGjQkXgLhYguQjEhpCFkxIBqiqQCKjKCcicQHVnVIYCHQAFACAGABIBVBAQCBBiCBA5QCsBKEJhlQCEgyBhhBQABAAAAgBQCDC0B0BIQH8C9IsiGIBAgUQBOgdBMgvQBkhACXisQBLhWA4hJIABAAIB4AAQBYAdBXAiIAAAAQBgAlBcArQAZALAYAMQCHBAB2BJIABAAQCHBSBxBdQCsCNB1CkQBBm4CZl5QB0kiCHiDQDYjTEHDDIBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QpuS/1JjFQiNAHjagjQm3hGmIjTQxzpnlx4hQghiNgbiUQgCgOgDgOQASAAATAAQFJADEmAjQKIBME0DKQCJBbBYCMAbAoqQhHgyhegwQg3gdg/gHQgegEggACQhkACiDALQgVACgUADQjnAYiDA9QgYALhHAxQg+AsgYAUQhaBOgpBOQgIANgJBFQgLBWASAlQAxBjChBSQA0AbBAAZQAVAHCJAbQCPAcAmACQAxADAwgCQCqgDCEgqQCDg1Beg2QDpiIgDiYQgDifjXiXgALxCDIFTBAIATtjALtpLIAELOAa0AsIAMpWAWUCDIARszAuRArQhRAZhTAnQgWALgUAKQh+BEgIA+");
	this.shape_10.setTransform(344.461,227.1604);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#FF99FF").s().p("AhYG6IATtjIgTNjIlThAIgErNIAELNQhAgZg0gbQihhTgxhjQgSglALhWQAJhDAIgNQAphOBahOQAYgVA+grQBHgyAYgKQCDg+DngYQAUgDAVgBQCCgMBkgCQAggBAeADQA/AHA3AdQBeAxBHAyIgMJVQheA3iDA0QiEAriqADIgfAAQghAAgggCgAD3F6IARszgAIXEjgAIjkyQDXCWADCfQADCXjpCJg");
	this.shape_11.setTransform(462.5815,202.4275);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#FF99FF").s().p("AhYG6IATtjIgTNjIlThAIgErNIAELNQhAgZg0gbQihhTgxhjQgSglALhWQAJhDAIgNQAphOBahOQAYgVA+grQBHgyAYgKQCDg+DngYQAUgDAVgBQCCgMBkgCQAggBAeADQA/AHA3AdQBeAxBHAyQDXCWADCfQADCXjpCJIAMpVIgMJVQheA3iDA0QiEAriqADIgfAAQghAAgggCgAD3F6IARszgAIXEjg");
	this.shape_12.setTransform(462.5815,215.0275);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2,p:{y:241.8604}},{t:this.shape_1,p:{y:217.1275}},{t:this.shape,p:{y:241.8604}},{t:this.instance,p:{y:-39.75}}]}).to({state:[{t:this.shape_2,p:{y:239.7604}},{t:this.shape_3},{t:this.shape,p:{y:239.7604}},{t:this.instance,p:{y:-41.85}}]},3).to({state:[{t:this.shape_6,p:{y:237.6604}},{t:this.shape_5,p:{y:212.9275}},{t:this.shape_4,p:{y:237.6604}},{t:this.instance,p:{y:-43.95}}]},3).to({state:[{t:this.shape_2,p:{y:235.5604}},{t:this.shape_1,p:{y:210.8275}},{t:this.shape,p:{y:235.5604}},{t:this.instance,p:{y:-46.05}}]},3).to({state:[{t:this.shape_6,p:{y:233.4604}},{t:this.shape_8},{t:this.shape_7,p:{y:233.4604}},{t:this.instance,p:{y:-48.15}}]},3).to({state:[{t:this.shape_6,p:{y:231.3604}},{t:this.shape_9},{t:this.shape_7,p:{y:231.3604}},{t:this.instance,p:{y:-50.25}}]},3).to({state:[{t:this.shape_6,p:{y:229.2604}},{t:this.shape_5,p:{y:204.5275}},{t:this.shape_4,p:{y:229.2604}},{t:this.instance,p:{y:-52.35}}]},3).to({state:[{t:this.shape_6,p:{y:227.1604}},{t:this.shape_11},{t:this.shape_10},{t:this.instance,p:{y:-54.45}}]},3).to({state:[{t:this.shape_6,p:{y:227.1604}},{t:this.shape_11},{t:this.shape_10},{t:this.instance,p:{y:-54.45}}]},3).to({state:[{t:this.shape_6,p:{y:229.2604}},{t:this.shape_5,p:{y:204.5275}},{t:this.shape_4,p:{y:229.2604}},{t:this.instance,p:{y:-52.35}}]},3).to({state:[{t:this.shape_6,p:{y:231.3604}},{t:this.shape_9},{t:this.shape_7,p:{y:231.3604}},{t:this.instance,p:{y:-50.25}}]},3).to({state:[{t:this.shape_6,p:{y:233.4604}},{t:this.shape_8},{t:this.shape_7,p:{y:233.4604}},{t:this.instance,p:{y:-48.15}}]},3).to({state:[{t:this.shape_2,p:{y:235.5604}},{t:this.shape_1,p:{y:210.8275}},{t:this.shape,p:{y:235.5604}},{t:this.instance,p:{y:-46.05}}]},3).to({state:[{t:this.shape_2,p:{y:237.6604}},{t:this.shape_1,p:{y:212.9275}},{t:this.shape,p:{y:237.6604}},{t:this.instance,p:{y:-43.95}}]},3).to({state:[{t:this.shape_6,p:{y:239.7604}},{t:this.shape_12},{t:this.shape_4,p:{y:239.7604}},{t:this.instance,p:{y:-41.85}}]},3).to({state:[{t:this.shape_2,p:{y:241.8604}},{t:this.shape_1,p:{y:217.1275}},{t:this.shape,p:{y:241.8604}},{t:this.instance,p:{y:-39.75}}]},3).wait(3));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1.5,-203.6,691.9,688.9);


(lib.happy_talk = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.happy_mouth_talk();
	this.instance.setTransform(215.25,425.8,1,1,0,0,0,127,120.3);

	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("rgba(0,0,0,0.839)").ss(4,1,1).p("AlHgWQiQieilhRQjmhzjwA3QkmBEiII6QgDALgDAMAYHCVQiTi6izhpQj6iTkXAnQlcAwjADZ");
	this.shape.setTransform(278.225,-21.4673);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("AaB35IhkDQQhjDkAEBfQCHBAB3BJQCHBTBxBcQCsCOB1CjQBBm4CZl4QEuryGsE8IBlCMQBhCTAVCyQBGI6rNKbICQC0QChDeBZDVQEdKmofFFQiCBrimg3QlJhxiusvIg6GPQhiHajCF9QpuS+1JjEQiNAHjagkQm3hGmIjTQzmqllB8sQiXgtiChQQkCigBviqIBqipQCKjLCcibQHanbIeCQQjchsiGnYQicoiHcn1QDGjTEuAtQEtAtECDNQAQgiARghQBAh4B7h4QAqgoA9ggQBaguBagfQH3imGwFgQGwFgBqHkQA0DwgiCrIglDJQgvDMgOA1IB5AAQBYAcBXAjQBgAlBcArQAZALAYALEAiWgSoQhuhfhwhMQhFBZhDBrQiEDWAQBcAe41TQidhpiag9Qi0hJimgGIg0DEQgwDVAOBjADb8xQAADmhjCiQhjCjiLAAQiMAAhkijQhjiiAAjmQAAjnBjiiQBkiiCMAAQCLAABjCiQBjCiAADngAUn5IQhSgBhMAQAqxrDQF6C/KIidIBAgUQBOgcBMgvQDxiaCNjxAl6jvIDmCIQAlAZAgAYIACABQCuCBAlBhALjBmQg5AZgjAgQgpAZgwAqQhhBUgoBUQh1D+G3CsQAeALAfAMIBuAXQBVAOBTAEQAxADAwgBQCqgDCEgrQBQgbBDgpICgiPQBjiugBinQgDkHlDgZQgFAAgFAAQhPgGhhAIQhlgCiDAMQgVABgUADQjnAYiDA+IAELOIFTBAIATtkEAiWgSoQg8BFg5BhQh1DDAICRAXJNIIBPtIEAkLgQ4QgrguhKhCEgO/gomQgBAAAAABQgxBkgkBmQgCAGgCAGQglBpgXBsQhPFkBJG9QBIG8FiDaA157kQgEDGhPCLQhQCNhuAAQhuAAhKiNQhKiLAEjGQADjHBQiNQBQiLBuAAQBtAABLCLQBKCNgEDHgA/AwfIBVA/QCBBiCBA5QCsBLEJhlQCEgzBihBIAMAYQAQAeAYAfQBLBiB4BFQATAKATAK");
	this.shape_1.setTransform(343.4418,310.8219);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FF99FF").s().p("Ag6G7IATtjIgTNjIlThAIgErOQCDg9DngYQAUgDAUgCQCDgLBlABQBhgIBPAGIAKAAIhPNIIBPtIQFDAZADEIQABCmhjCuIigCOQhDAqhQAbQiEAqiqADIggABQggAAgggCgArPgvQAohUBhhUQAwgpApgaQAjgfA5gaIAELOQm3itB1j9g");
	this.shape_2.setTransform(457.5445,354.9759);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#000000").s().p("AHwGIQhjiiAAjmQAAjmBjiiQBkiiCMAAQCMAABjCiQBjCiAADmQAADmhjCiQhjCjiMAAQiMAAhkijgAvrGeQhKiLAEjGQADjGBQiNQBQiLBuAAQBtAABLCLQBKCNgEDGQgEDGhPCLQhQCNhuAAQhuAAhKiNg");
	this.shape_3.setTransform(257.9148,126.625);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#FFFFFF").s().p("AgYR8QljjahIm9QgjjVAAjBQAAjQApi6QAYhrAkhpQgkBpgYBrQgpC6AADQQAADBAjDVQBIG9FjDaIgmgVQh4hEhMhjQgXgfgRgeIgLgYQhiBCiEAyQkJBlishKQiCg5iAhiIhVhAQjchsiGnXQidohHcn2QDHjSEtAtQEuAsEBDNIgBACIABgCQAQghASghQA/h4B8h4QApgpA8gfQBagvBagfQH5ilGwFgQGwFgBpHjQA1DwgiCrIglDJQgwDMgOA0QiNDxjxCaQhLAvhPAdIhAAUQkkBHjuAAQkhAAjOhpgAExl6QhjCiAADlQAADmBjCjQBkCjCMAAQCNAABjijQBjijAAjmQAAjlhjiiQhjijiNAAQiMAAhkCjgAycj4QhQCNgEDFQgEDGBLCMQBKCNBuAAQBtAABQiNQBQiMAEjGQADjFhKiNQhKiMhuAAQhuAAhPCMgAmBoPIgHAiQgUBgAgiPQAkhmAwhjQg9BWgcCAg");
	this.shape_4.setTransform(276.9821,125.2577);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#FFCCFF").s().p("EgDPAlXQiNAHjagjQm3hGmIjTQzmqllB8rQiXguiChPQkCiiBvipIBqiqQCKjKCcicQHanaIeCPIBVBAQCBBiCBA5QCsBKEJhlQCEgyBihCIAMAYQAQAeAYAfQBLBjB4BEIAmAVQF6C+KIicIBAgUQBOgdBMgvQDxiaCNjxIB5AAQBYAdBXAiQBgAlBcArIAxAXQCHBAB3BJQCHBSBxBdQCsCNB1CkQBBm4CZl5QEuryGsE9IBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QoXQWw2AAQitAAi9gcgAR2qlQgVACgUADQjnAYiDA9Qg5AagjAfQgpAagwApQhhBUgoBUQh1D+G3CsIA9AWIBuAXQBVAOBTAFQAxADAwgCQCqgDCEgqQBQgbBDgqICgiNQBjiugBinQgDkIlDgZIgKAAQhPgGhhAIIgYAAQhcAAh0AKgAiUsYQAlAYAgAYIACACQCuCCAlBgQglhgiuiCIgCgCQgggYglgYIjmiJg");
	this.shape_5.setTransform(343.4418,379.7645);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("AaB35IhkDQQhjDkAEBfQCHBAB3BJQCHBTBxBcQCsCOB1CjQBBm4CZl4QEuryGsE8IBlCMQBhCTAVCyQBGI6rNKbICQC0QChDeBZDVQEdKmofFFQiCBrimg3QlJhxiusvIg6GPQhiHajCF9QpuS+1JjEQiNAHjagkQm3hGmIjTQzmqllB8sQiXgtiChQQkCigBviqIBqipQCKjLCcibQHanbIeCQQjchsiGnYQicoiHcn1QDGjTEuAtQEtAtECDNQAQgiARghQBAh4B7h4QAqgoA9ggQBaguBagfQH3imGwFgQGwFgBqHkQA0DwgiCrIglDJQgvDMgOA1IB5AAQBYAcBXAjAe41TQhFBZhDBrQiEDWAQBcEAiWgSoQhuhfhwhMQidhpiag9Qi0hJimgGQhSgBhMAQADb8xQAADmhjCiQhjCjiLAAQiMAAhkijQhjiiAAjmQAAjnBjiiQBkiiCMAAQCLAABjCiQBjCiAADngAUn5IIg0DEQgwDVAOBjQBgAlBcArQAZALAYALAqxrDQF6C/KIidIBAgUQBOgcBMgvQDxiaCNjxAl6jvIDmCIQAlAZAgAYIACABQCuCBAlBhALjBmQg5AZgjAgQgpAZgwAqQhhBUgoBUQh1D+G3CsQAeALAfAMIBuAXQBVAOBTAEQAxADAwgBQCqgDCEgrQBQgbBDgpICgiPQBjiugBinQgDkHlDgZQgFAAgFAAQhPgGhhAIQhlgCiDAMQgVABgUADQjnAYiDA+IAELOIFTBAIATtkEAiWgSoQg8BFg5BhQh1DDAICRAXJNIIBPtIEAkLgQ4QgrguhKhCEgO/gomQgBAAAAABQgxBkgkBmQgCAGgCAGQglBpgXBsQhPFkBJG9QBIG8FiDaA157kQgEDGhPCLQhQCNhuAAQhuAAhKiNQhKiLAEjGQADjHBQiNQBQiLBuAAQBtAABLCLQBKCNgEDHgA/AwfIBVA/QCBBiCBA5QCsBLEJhlQCEgzBihBIAMAYQAQAeAYAfQBLBiB4BFQATAKATAK");
	this.shape_6.setTransform(343.4418,309.0219);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#FFCCFF").s().p("EgDPAlXQiNAHjagjQm3hGmIjTQzmqllB8rQiXguiChPQkCiiBvipIBqiqQCKjKCcicQHanaIeCPIBVBAQCBBiCBA5QCsBKEJhlQCEgyBihCIAMAYQAQAeAYAfQBLBjB4BEIAmAVQF6C+KIicIBAgUQBOgdBMgvQDxiaCNjxIB5AAQBYAdBXAiQBgAlBcArIAxAXQCHBAB3BJQCHBSBxBdQCsCNB1CkQBBm4CZl5QEuryGsE9IBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QoXQWw2AAQitAAi9gcgAR2qlQgVACgUADQjnAYiDA9Qg5AagjAfQgpAagwApQhhBUgoBUQh1D+G3CsIA9AWIBuAXQBVAOBTAFQAxADAwgCQCqgDCEgqQBQgbBDgqICgiNQBjiugBinQgDkIlDgZIgKAAQhPgGhhAIIgYAAQhcAAh0AKgACGoEIgEgJQgphdimh8IgCgCQgggYglgYIjmiJIDmCJQAlAYAgAYIACACQCmB8ApBdIAEAJg");
	this.shape_7.setTransform(343.4418,377.9645);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("AaB35IhkDQQhjDkAEBfQCHBAB3BJQCHBTBxBcQCsCOB1CjQBBm4CZl4QEuryGsE8IBlCMQBhCTAVCyQBGI6rNKbICQC0QChDeBZDVQEdKmofFFQiCBrimg3QlJhxiusvIg6GPQhiHajCF9QpuS+1JjEQiNAHjagkQm3hGmIjTQzmqllB8sQiXgtiChQQkCigBviqIBqipQCKjLCcibQHanbIeCQQjchsiGnYQicoiHcn1QDGjTEuAtQEtAtECDNQAQgiARghQBAh4B7h4QAqgoA9ggQBaguBagfQH3imGwFgQGwFgBqHkQA0DwgiCrIglDJQgvDMgOA1IB5AAQBYAcBXAjQBgAlBcArQAZALAYALAe41TQhFBZhDBrQiEDWAQBcEAiWgSoQhuhfhwhMQidhpiag9Qi0hJimgGQhSgBhMAQADb8xQAADmhjCiQhjCjiLAAQiMAAhkijQhjiiAAjmQAAjnBjiiQBkiiCMAAQCLAABjCiQBjCiAADngAUn5IIg0DEQgwDVAOBjAqxrDQF6C/KIidIBAgUQBOgcBMgvQDxiaCNjxAl6jvIDmCIQAlAZAgAYIACABQCuCBAlBhALjBmQg5AZgjAgQgpAZgwAqQhhBUgoBUQh1D+G3CsQAeALAfAMIBuAXQBVAOBTAEQAxADAwgBQCqgDCEgrQBQgbBDgpICgiPQBjiugBinQgDkHlDgZQgFAAgFAAQhPgGhhAIQhlgCiDAMQgVABgUADQjnAYiDA+IAELOIFTBAIATtkEAiWgSoQg8BFg5BhQh1DDAICRAXJNIIBPtIEAkLgQ4QgrguhKhCEgO/gomQgBAAAAABQgxBkgkBmQgCAGgCAGQglBpgXBsQhPFkBJG9QBIG8FiDaA157kQgEDGhPCLQhQCNhuAAQhuAAhKiNQhKiLAEjGQADjHBQiNQBQiLBuAAQBtAABLCLQBKCNgEDHgA/AwfIBVA/QCBBiCBA5QCsBLEJhlQCEgzBihBIAMAYQAQAeAYAfQBLBiB4BFQATAKATAK");
	this.shape_8.setTransform(343.4418,310.8219);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("AaB35IhkDQQhjDkAEBfQCHBAB3BJQCHBTBxBcQCsCOB1CjQBBm4CZl4QEuryGsE8IBlCMQBhCTAVCyQBGI6rNKbICQC0QChDeBZDVQEdKmofFFQiCBrimg3QlJhxiusvIg6GPQhiHajCF9QpuS+1JjEQiNAHjagkQm3hGmIjTQzmqllB8sQiXgtiChQQkCigBviqIBqipQCKjLCcibQHanbIeCQQjchsiGnYQicoiHcn1QDGjTEuAtQEtAtECDNQAQgiARghQBAh4B7h4QAqgoA9ggQBaguBagfQH3imGwFgQGwFgBqHkQA0DwgiCrIglDJQgvDMgOA1IB5AAQBYAcBXAjQBgAlBcArQAZALAYALAe41TQhFBZhDBrQiEDWAQBcEAiWgSoQhuhfhwhMQidhpiag9Qi0hJimgGQhSgBhMAQADb8xQAADmhjCiQhjCjiLAAQiMAAhkijQhjiiAAjmQAAjnBjiiQBkiiCMAAQCLAABjCiQBjCiAADngAUn5IIg0DEQgwDVAOBjAqxrDQF6C/KIidIBAgUQBOgcBMgvQDxiaCNjxAl6jvIDmCIQAlAZAgAYIACABQCuCBAlBhALjBmQg5AZgjAgQgpAZgwAqQhhBUgoBUQh1D+G3CsQAeALAfAMIBuAXQBVAOBTAEQAxADAwgBQCqgDCEgrQBQgbBDgpICgiPQBjiugBinQgDkHlDgZQgFAAgFAAQhPgGhhAIQhlgCiDAMQgVABgUADALnM0IFTBAIATtkQjnAYiDA+gEAiWgSoQg8BFg5BhQh1DDAICRAXJNIIBPtIEAkLgQ4QgrguhKhCEgO/gomQgBAAAAABQgxBkgkBmQgCAGgCAGQglBpgXBsQhPFkBJG9QBIG8FiDaA157kQgEDGhPCLQhQCNhuAAQhuAAhKiNQhKiLAEjGQADjHBQiNQBQiLBuAAQBtAABLCLQBKCNgEDHgA/AwfIBVA/QCBBiCBA5QCsBLEJhlQCEgzBihBIAMAYQAQAeAYAfQBLBiB4BFQATAKATAK");
	this.shape_9.setTransform(343.4418,307.2219);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#FF99FF").s().p("Ag6G7IATtjQAUgDAUgCQCDgLBlABQBhgIBPAGIAKAAIhPNIQiEAqiqADIggABQggAAgggCgAmNF7IgErOIAELOQm3itB1j9QAohUBhhUQAwgpApgaQAjgfA5gaQCDg9DngYIgTNjgAFUGPgAGjm5QFDAZADEIQABCmhjCuIigCOQhDAqhQAbg");
	this.shape_10.setTransform(457.5445,351.3759);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("AaB35IhkDQQhjDkAEBfQCHBAB3BJQCHBTBxBcQCsCOB1CjQBBm4CZl4QEuryGsE8IBlCMQBhCTAVCyQBGI6rNKbICQC0QChDeBZDVQEdKmofFFQiCBrimg3QlJhxiusvIg6GPQhiHajCF9QpuS+1JjEQiNAHjagkQm3hGmIjTQzmqllB8sQiXgtiChQQkCigBviqIBqipQCKjLCcibQHanbIeCQQjchsiGnYQicoiHcn1QDGjTEuAtQEtAtECDNQAQgiARghQBAh4B7h4QAqgoA9ggQBaguBagfQH3imGwFgQGwFgBqHkQA0DwgiCrIglDJQgvDMgOA1IB5AAQBYAcBXAjQBgAlBcArQAZALAYALAe41TQhFBZhDBrQiEDWAQBcEAiWgSoQhuhfhwhMQidhpiag9Qi0hJimgGQhSgBhMAQEAkLgQ4QgrguhKhCQg8BFg5BhQh1DDAICRADb8xQAADmhjCiQhjCjiLAAQiMAAhkijQhjiiAAjmQAAjnBjiiQBkiiCMAAQCLAABjCiQBjCiAADngAUn5IIg0DEQgwDVAOBjAqxrDQF6C/KIidIBAgUQBOgcBMgvQDxiaCNjxALjBmQg5AZgjAgQgpAZgwAqQhhBUgoBUQh1D+G3CsQAeALAfAMIBuAXQBVAOBTAEQAxADAwgBQCqgDCEgrQBQgbBDgpICgiPQBjiugBinQgDkHlDgZQgFAAgFAAQhPgGhhAIQhlgCiDAMQgVABgUADAl6jvIDmCIQAlAZAgAYIACABQCuCBAlBhALnM0IFTBAIATtkQjnAYiDA+gAXJNIIBPtIEgO/gomQgBAAAAABQgxBkgkBmQgCAGgCAGQglBpgXBsQhPFkBJG9QBIG8FiDaA157kQgEDGhPCLQhQCNhuAAQhuAAhKiNQhKiLAEjGQADjHBQiNQBQiLBuAAQBtAABLCLQBKCNgEDHgA/AwfIBVA/QCBBiCBA5QCsBLEJhlQCEgzBihBIAMAYQAQAeAYAfQBLBiB4BFQATAKATAK");
	this.shape_11.setTransform(343.4418,305.4219);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#FF99FF").s().p("Ag6G7IATtjIgTNjIlThAIgErOIAELOQm3itB1j9QAohUBhhUQAwgpApgaQAjgfA5gaQCDg9DngYQAUgDAUgCQCDgLBlABQBhgIBPAGIAKAAIhPNIQiEAqiqADIggABQggAAgggCgAFUGPgAGjm5QFDAZADEIQABCmhjCuIigCOQhDAqhQAbg");
	this.shape_12.setTransform(457.5445,349.5759);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("AaB35IhkDQQhjDkAEBfQCHBAB3BJQCHBTBxBcQCsCOB1CjQBBm4CZl4QEuryGsE8IBlCMQBhCTAVCyQBGI6rNKbICQC0QChDeBZDVQEdKmofFFQiCBrimg3QlJhxiusvIg6GPQhiHajCF9QpuS+1JjEQiNAHjagkQm3hGmIjTQzmqllB8sQiXgtiChQQkCigBviqIBqipQCKjLCcibQHanbIeCQQjchsiGnYQicoiHcn1QDGjTEuAtQEtAtECDNQAQgiARghQBAh4B7h4QAqgoA9ggQBaguBagfQH3imGwFgQGwFgBqHkQA0DwgiCrIglDJQgvDMgOA1IB5AAQBYAcBXAjQBgAlBcArQAZALAYALEAiWgSoQhuhfhwhMQhFBZhDBrQiEDWAQBcAe41TQidhpiag9Qi0hJimgGQhSgBhMAQEAkLgQ4QgrguhKhCQg8BFg5BhQh1DDAICRADb8xQAADmhjCiQhjCjiLAAQiMAAhkijQhjiiAAjmQAAjnBjiiQBkiiCMAAQCLAABjCiQBjCiAADngAUn5IIg0DEQgwDVAOBjAqxrDQF6C/KIidIBAgUQBOgcBMgvQDxiaCNjxAl6jvIDmCIQAlAZAgAYIACABQCuCBAlBhALjBmQg5AZgjAgQgpAZgwAqQhhBUgoBUQh1D+G3CsQAeALAfAMIBuAXQBVAOBTAEQAxADAwgBQCqgDCEgrQBQgbBDgpICgiPQBjiugBinQgDkHlDgZQgFAAgFAAQhPgGhhAIQhlgCiDAMQgVABgUADQjnAYiDA+IAELOIFTBAIATtkAXJNIIBPtIEgO/gomQgBAAAAABQgxBkgkBmQgCAGgCAGQglBpgXBsQhPFkBJG9QBIG8FiDaA157kQgEDGhPCLQhQCNhuAAQhuAAhKiNQhKiLAEjGQADjHBQiNQBQiLBuAAQBtAABLCLQBKCNgEDHgA/AwfIBVA/QCBBiCBA5QCsBLEJhlQCEgzBihBIAMAYQAQAeAYAfQBLBiB4BFQATAKATAK");
	this.shape_13.setTransform(343.4418,301.8219);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("AaB35IhkDQQhjDkAEBfQCHBAB3BJQCHBTBxBcQCsCOB1CjQBBm4CZl4QEuryGsE8IBlCMQBhCTAVCyQBGI6rNKbICQC0QChDeBZDVQEdKmofFFQiCBrimg3QlJhxiusvIg6GPQhiHajCF9QpuS+1JjEQiNAHjagkQm3hGmIjTQzmqllB8sQiXgtiChQQkCigBviqIBqipQCKjLCcibQHanbIeCQQjchsiGnYQicoiHcn1QDGjTEuAtQEtAtECDNQAQgiARghQBAh4B7h4QAqgoA9ggQBaguBagfQH3imGwFgQGwFgBqHkQA0DwgiCrIglDJQgvDMgOA1IB5AAQBYAcBXAjQBgAlBcArQAZALAYALEAiWgSoQhuhfhwhMQhFBZhDBrQiEDWAQBcAe41TQidhpiag9Qi0hJimgGQhSgBhMAQEAkLgQ4QgrguhKhCQg8BFg5BhQh1DDAICRADb8xQAADmhjCiQhjCjiLAAQiMAAhkijQhjiiAAjmQAAjnBjiiQBkiiCMAAQCLAABjCiQBjCiAADngAUn5IIg0DEQgwDVAOBjAqxrDQF6C/KIidIBAgUQBOgcBMgvQDxiaCNjxALjBmQg5AZgjAgQgpAZgwAqQhhBUgoBUQh1D+G3CsQAeALAfAMIBuAXQBVAOBTAEQAxADAwgBQCqgDCEgrQBQgbBDgpICgiPQBjiugBinQgDkHlDgZQgFAAgFAAQhPgGhhAIQhlgCiDAMQgVABgUADQjnAYiDA+IAELOIFTBAIATtkAl6jvIDmCIQAlAZAgAYIACABQCuCBAlBhAXJNIIBPtIEgO/gomQgBAAAAABQgxBkgkBmQgCAGgCAGQglBpgXBsQhPFkBJG9QBIG8FiDaA157kQgEDGhPCLQhQCNhuAAQhuAAhKiNQhKiLAEjGQADjHBQiNQBQiLBuAAQBtAABLCLQBKCNgEDHgA/AwfIBVA/QCBBiCBA5QCsBLEJhlQCEgzBihBIAMAYQAQAeAYAfQBLBiB4BFQATAKATAK");
	this.shape_14.setTransform(343.4418,303.6219);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#FF99FF").s().p("Ag6G7IATtjIgTNjIlThAIgErOQCDg9DngYQAUgDAUgCQCDgLBlABQBhgIBPAGIAKAAIhPNIQiEAqiqADIggABQggAAgggCgAFUGPgAGjm5QFDAZADEIQABCmhjCuIigCOQhDAqhQAbgArPgvQAohUBhhUQAwgpApgaQAjgfA5gaIAELOQm3itB1j9gAmRlTg");
	this.shape_15.setTransform(457.5445,347.7759);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("AaB35IhkDQQhjDkAEBfQCHBAB3BJQCHBTBxBcQCsCOB1CjQBBm4CZl4QEuryGsE8IBlCMQBhCTAVCyQBGI6rNKbICQC0QChDeBZDVQEdKmofFFQiCBrimg3QlJhxiusvIg6GPQhiHajCF9QpuS+1JjEQiNAHjagkQm3hGmIjTQzmqllB8sQiXgtiChQQkCigBviqIBqipQCKjLCcibQHanbIeCQQjchsiGnYQicoiHcn1QDGjTEuAtQEtAtECDNQAQgiARghQBAh4B7h4QAqgoA9ggQBaguBagfQH3imGwFgQGwFgBqHkQA0DwgiCrIglDJQgvDMgOA1IB5AAQBYAcBXAjQBgAlBcArQAZALAYALEAiWgSoQhuhfhwhMQhFBZhDBrQiEDWAQBcAe41TQidhpiag9Qi0hJimgGQhSgBhMAQADb8xQAADmhjCiQhjCjiLAAQiMAAhkijQhjiiAAjmQAAjnBjiiQBkiiCMAAQCLAABjCiQBjCiAADngAUn5IIg0DEQgwDVAOBjAqxrDQF6C/KIidIBAgUQBOgcBMgvQDxiaCNjxAl6jvIDmCIQAlAZAgAYIACABQCuCBAlBhALjBmQg5AZgjAgQgpAZgwAqQhhBUgoBUQh1D+G3CsQAeALAfAMIBuAXQBVAOBTAEQAxADAwgBQCqgDCEgrQBQgbBDgpICgiPQBjiugBinQgDkHlDgZQgFAAgFAAQhPgGhhAIQhlgCiDAMQgVABgUADQjnAYiDA+IAELOIFTBAIATtkEAiWgSoQg8BFg5BhQh1DDAICRAXJNIIBPtIEAkLgQ4QgrguhKhCEgO/gomQgBAAAAABQgxBkgkBmQgCAGgCAGQglBpgXBsQhPFkBJG9QBIG8FiDaA157kQgEDGhPCLQhQCNhuAAQhuAAhKiNQhKiLAEjGQADjHBQiNQBQiLBuAAQBtAABLCLQBKCNgEDHgA/AwfIBVA/QCBBiCBA5QCsBLEJhlQCEgzBihBIAMAYQAQAeAYAfQBLBiB4BFQATAKATAK");
	this.shape_16.setTransform(343.4418,307.2219);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_5,p:{y:379.7645}},{t:this.shape_4,p:{y:125.2577}},{t:this.shape_3,p:{y:126.625}},{t:this.shape_2,p:{y:354.9759}},{t:this.shape_1,p:{y:310.8219}},{t:this.shape,p:{y:-21.4673}},{t:this.instance,p:{x:215.25,y:425.8}}]}).to({state:[{t:this.shape_4,p:{y:123.4577}},{t:this.shape_3,p:{y:124.825}},{t:this.shape_7},{t:this.shape_2,p:{y:353.1759}},{t:this.shape,p:{y:-23.2673}},{t:this.shape_6},{t:this.instance,p:{x:206.85,y:419.8}}]},4).to({state:[{t:this.shape_4,p:{y:125.2577}},{t:this.shape_3,p:{y:126.625}},{t:this.shape_5,p:{y:379.7645}},{t:this.shape_2,p:{y:354.9759}},{t:this.shape,p:{y:-21.4673}},{t:this.shape_8},{t:this.instance,p:{x:206.85,y:421.6}}]},3).to({state:[{t:this.shape_4,p:{y:123.4577}},{t:this.shape_3,p:{y:124.825}},{t:this.shape_7},{t:this.shape_2,p:{y:353.1759}},{t:this.shape,p:{y:-23.2673}},{t:this.shape_6},{t:this.instance,p:{x:206.85,y:419.8}}]},3).to({state:[{t:this.shape_4,p:{y:121.6577}},{t:this.shape_3,p:{y:123.025}},{t:this.shape_5,p:{y:376.1645}},{t:this.shape_10},{t:this.shape,p:{y:-25.0673}},{t:this.shape_9},{t:this.instance,p:{x:206.85,y:418}}]},3).to({state:[{t:this.shape_4,p:{y:119.8577}},{t:this.shape_3,p:{y:121.225}},{t:this.shape_5,p:{y:374.3645}},{t:this.shape_12,p:{y:349.5759}},{t:this.shape,p:{y:-26.8673}},{t:this.shape_11,p:{y:305.4219}},{t:this.instance,p:{x:206.85,y:416.2}}]},3).to({state:[{t:this.shape_4,p:{y:118.0577}},{t:this.shape_3,p:{y:119.425}},{t:this.shape_5,p:{y:372.5645}},{t:this.shape_12,p:{y:347.7759}},{t:this.shape,p:{y:-28.6673}},{t:this.shape_11,p:{y:303.6219}},{t:this.instance,p:{x:206.85,y:414.4}}]},4).to({state:[{t:this.shape_4,p:{y:116.2577}},{t:this.shape_3,p:{y:117.625}},{t:this.shape_5,p:{y:370.7645}},{t:this.shape_2,p:{y:345.9759}},{t:this.shape,p:{y:-30.4673}},{t:this.shape_13},{t:this.instance,p:{x:206.85,y:412.6}}]},4).to({state:[{t:this.shape_4,p:{y:118.0577}},{t:this.shape_3,p:{y:119.425}},{t:this.shape_5,p:{y:372.5645}},{t:this.shape_15,p:{y:347.7759}},{t:this.shape,p:{y:-28.6673}},{t:this.shape_14,p:{y:303.6219}},{t:this.instance,p:{x:206.85,y:414.4}}]},4).to({state:[{t:this.shape_4,p:{y:119.8577}},{t:this.shape_3,p:{y:121.225}},{t:this.shape_5,p:{y:374.3645}},{t:this.shape_15,p:{y:349.5759}},{t:this.shape,p:{y:-26.8673}},{t:this.shape_14,p:{y:305.4219}},{t:this.instance,p:{x:206.85,y:416.2}}]},4).to({state:[{t:this.shape_4,p:{y:121.6577}},{t:this.shape_3,p:{y:123.025}},{t:this.shape_5,p:{y:376.1645}},{t:this.shape_2,p:{y:351.3759}},{t:this.shape,p:{y:-25.0673}},{t:this.shape_16},{t:this.instance,p:{x:206.85,y:418}}]},4).to({state:[{t:this.shape_4,p:{y:123.4577}},{t:this.shape_3,p:{y:124.825}},{t:this.shape_7},{t:this.shape_2,p:{y:353.1759}},{t:this.shape,p:{y:-23.2673}},{t:this.shape_1,p:{y:309.0219}},{t:this.instance,p:{x:206.85,y:419.8}}]},3).to({state:[{t:this.shape_4,p:{y:125.2577}},{t:this.shape_3,p:{y:126.625}},{t:this.shape_5,p:{y:379.7645}},{t:this.shape_2,p:{y:354.9759}},{t:this.shape,p:{y:-21.4673}},{t:this.shape_1,p:{y:310.8219}},{t:this.instance,p:{x:206.85,y:421.6}}]},3).wait(3));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1.5,-66.4,689.9,689.6);


(lib.happy_sailence = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_2
	this.instance = new lib.happy_mouth_sailence();
	this.instance.setTransform(-254.5,32.55);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(60));

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("rgba(0,0,0,0.839)").ss(4,1,1).p("AX7CFQiTi7izhpQj6iTkXAnQlcAxjADZAk7gWQiQieilhRQjmhzjwA3QkmBEiII6QgDALgDAM");
	this.shape.setTransform(-62.175,-295.5173);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("EgO/gomQAQgiARghQBAh4B7h4QAqgoA9ggQBaguBagfQH3imGwFgQGwFgBqHkQA0DwgiCrIglDJQgvDMgOA1IB5AAQAxAQAwARQAjANAiANQAFACAEACQBgAlBcArQAZALAYALQCHBAB3BJQCHBTBxBcQBAA1A4A4QAMAMAMAMQBRBTBABZQBBm4CZl4QEuryGsE8IBlCMQBhCTAVCyQBGI6rNKbICQC0QChDeBZDVQEdKmofFFQiCBrimg3QlJhxiusvIg6GPQhiHajCF9QpuS+1JjEQiNAHjagkQm3hGmIjTQzmqllB8sQiXgtiChQQkCigBviqIBqipQCKjLCcibQHanbIeCQQjchsiGnYQicoiHcn1QDGjTEuAtQEtAtECDNQgBAAAAABQgxBkgkBmQgCAGgCAGQglBpgXBsQhPFkBJG9QBIG8FiDaQF6C/KIidIBAgUQBOgcBMgvQDxiaCNjxAUn5IIg0DEQgwDSAOBiQAAACAAACAUn5IQhSgBhMAQADb8xQAADmhjCiQhjCjiLAAQiMAAhkijQhjiiAAjmQAAjnBjiiQBkiiCMAAQCLAABjCiQBjCiAADngAaB35IhkDQQg5CCgXBXQgRBBACApAe41TQidhpiag9Qi0hJimgGEAkLgQ4QgKgLgNgNQgmgmg4gyQgiAogiAwQgHALgHALQgMASgMATQgFAJgGAKQh1DDAICREAiWgSoQgpgjgpghQgMgJgMgKQg6gsg6goQhFBZhDBrQgUAhgRAeQhdClAOBOAXJNIQBQgbBDgpICgiPQBjiugBinQgDkHlDgZQgFAAgFAAQhPgGhhAIQhlgCiDAMQgVABgUADQjnAYiDA+Qg5AZgjAgQgpAZgwAqQhhBUgoBUQh1D+G3CsQAeALAfAMIBuAXQBVAOBTAEQAxADAwgBQCqgDCEgrIBPtIALnM0IFTBAIATtkALjBmIAELOA157kQgEDGhPCLQhQCNhuAAQhuAAhKiNQhKiLAEjGQADjHBQiNQBQiLBuAAQBtAABLCLQBKCNgEDHgA/AwfIBVA/QCBBiCBA5QCsBLEJhlQCEgzBihBIAMAYQAQAeAYAfQBLBiB4BFQATAKATAKAl6jvIDmCIQAlAZAgAYIACABQCuCBAlBh");
	this.shape_1.setTransform(0.5418,36.4719);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FFCCFF").s().p("EgDPAlXQiNAHjagjQm3hGmIjTQzmqllB8rQiXguiChPQkCiiBvipIBqiqQCKjKCcicQHanaIeCPIBVBAQCBBiCBA5QCsBKEJhlQCEgyBihCIAMAYQAQAeAYAfQBLBjB4BEIAmAVQF6C+KIicIBAgUQBOgdBMgvQDxiaCNjxIB5AAQAxAQAwASIBFAaIAJADQBgAlBcArIAxAXQCHBAB3BJQCHBSBxBdQBAA1A4A3IAYAZQBRBSBABaQBBm4CZl5QEuryGsE9IBlCLQBhCTAVCyQBGI6rNKdICQC0QChDeBZDUQEdKmofFFQiCBrimg4QlJhxiusvIg6GPQhiHbjCF8QoXQWw2AAQitAAi9gcgAR2qlQgVACgUADQjnAYiDA9Qg5AagjAfQgpAagwApQhhBUgoBUQh1D+G3CsIA9AWIBuAXQBVAOBTAFQAxADAwgCQCqgDCEgqQBQgbBDgqICgiNQBjiugBinQgDkIlDgZIgKAAQhPgGhhAIIgYAAQhcAAh0AKgAiUsYQAlAYAgAYIACACQCuCCAlBgQglhgiuiCIgCgCQgggYglgYIjmiJg");
	this.shape_2.setTransform(0.5418,105.4145);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FF99FF").s().p("Ag6G7IATtjIgTNjIlThAIgErOQCDg9DngYQAUgDAUgCQCDgLBlABQBhgIBPAGIAKAAQFDAZADEIQABCmhjCuIigCOQhDAqhQAbIBPtIIhPNIQiEAqiqADIggABQggAAgggCgArPgvQAohUBhhUQAwgpApgaQAjgfA5gaIAELOQm3itB1j9g");
	this.shape_3.setTransform(114.6445,80.6259);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#FFFFFF").s().p("AgYR8QljjahIm9QgjjVAAjBQAAjQApi6QAYhrAkhpQgkBpgYBrQgpC6AADQQAADBAjDVQBIG9FjDaIgmgVQh4hEhMhjQgXgfgRgeIgLgYQhiBCiEAyQkJBlishKQiCg5iAhiIhVhAQjchsiGnXQidohHcn2QDHjSEtAtQEuAsEBDNIgBACIABgCQAQghASghQA/h4B8h4QApgpA8gfQBagvBagfQH5ilGwFgQGwFgBpHjQA1DwgiCrIglDJQgwDMgOA0QiNDxjxCaQhLAvhPAdIhAAUQkkBHjuAAQkhAAjOhpgAExl6QhjCiAADlQAADmBjCjQBkCjCMAAQCNAABjijQBjijAAjmQAAjlhjiiQhjijiNAAQiMAAhkCjgAycj4QhQCNgEDFQgEDGBLCMQBKCNBuAAQBtAABQiNQBQiMAEjGQADjFhKiNQhKiMhuAAQhuAAhPCMgAmBoPIgHAiQgUBgAgiPQAkhmAwhjQg9BWgcCAg");
	this.shape_4.setTransform(-65.9179,-149.0923);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#000000").s().p("AHwGIQhjiiAAjmQAAjmBjiiQBkiiCMAAQCMAABjCiQBjCiAADmQAADmhjCiQhjCjiMAAQiMAAhkijgAvrGeQhKiLAEjGQADjGBQiNQBQiLBuAAQBtAABLCLQBKCNgEDGQgEDGhPCLQhQCNhuAAQhuAAhKiNg");
	this.shape_5.setTransform(-84.9852,-147.725);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("EgN4gomQAQgiARghQBAh4B7h4QAqgoA9ggQBaguBagfQH3imGwFgQGwFgBqHkQA0DwgiCrIglDJQgvDMgOA1IB5AAQAxAQAwARQAjANAjANQAEACAEACQBgAlBcArQAZALAYALQCHBAB3BJQCHBTBxBcQBAA1A4A4QANAMALAMQAHAHAGAGAVu5IIg0DEQgvDSANBiQAAACAAACAVu5IQhSgBhMAQAEi8xQAADmhjCiQhjCjiLAAQiMAAhkijQhjiiAAjmQAAjnBjiiQBkiiCMAAQCLAABjCiQBjCiAADngApqrDQF6C/KIidIBAgUQBOgcBMgvQDxiaCNjxAbI35IhkDQQg5CCgXBXQgRBBACApEAiYgIaQBABMA0BRQA6m4CIl4QEOryF9E8IBbCMQBWCTATCyQA/I6qAKbICBC0QCPDeBPDVQD+KmnkFFQh0BriTg3QkdhuibsCAf/1TQidhpiag9Qi0hJimgGEAjUgSoQgegdgegdQAAAAgBgBQgGgEgGgFQgMgJgMgKQg5gsg7goQhFBZhDBrQgUAhgRAeQhdClAOBOEAjUgSoQgeAogeAwQgBACAAACQgGAIgGAKQgMASgMATQgFAJgGAKQh1DDAICREAk9gQ4QgKgLgLgNQgigmgygyEAiWANSQgEgUgFgVIg6GPQhiHajCF9QpuS+1JjEQiNAHjagkQm3hGmIjTQzmqllB8sQiXgtiChQQkCigBviqIBqipQCKjLCcibQHanbIeCQQjchsiGnYQicoiHcn1QDGjTEuAtQEtAtECDNQgBAAAAABQgxBkgkBmQgCAGgCAGQglBpgXBsQhPFkBJG9QBIG8FiDaAYQNIQBQgbBDgpICgiPQBjiugBinQgDkHlDgZQgFAAgFAAQhPgGhhAIQhlgCiDAMQgVABgUADQjnAYiDA+Qg5AZgjAgQgpAZgwAqQhhBUgoBUQh1D+G3CsQAeALAfAMIBuAXQBVAOBTAEQAxADAwgBQCqgDCEgrIBPtIAMuM0IFTBAIATtkAMqBmIAELOA0y7kQgEDGhPCLQhQCNhuAAQhuAAhKiNQhKiLAEjGQADjHBQiNQBQiLBuAAQBtAABLCLQBKCNgEDHgA95wfIBVA/QCBBiCBA5QCsBLEJhlQCEgzBihBIAMAYQAQAeAYAfQBLBiB4BFQATAKATAKAkzjvIDmCIQAlAZAgAYIACABQCuCBAlBh");
	this.shape_6.setTransform(-6.5913,36.4719);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#FFCCFF").s().p("EgCIAlXQiNAHjagjQm3hGmIjTQzmqllB8rQiXguiChPQkCiiBvipIBqiqQCKjKCcicQHanaIeCPIBVBAQCBBiCBA5QCsBKEJhlQCEgyBihCIAMAYQAQAeAYAfQBLBjB4BEIAmAVQF6C+KIicIBAgUQBOgdBMgvQDxiaCNjxIB5AAQAxAQAwASIBGAaIAIADQBgAlBcArIAxAXQCHBAB3BJQCHBSBxBdQBAA1A4A3IAYAZIANANIAAACQBABLA0BSQA6m4CIl5QEOryF9E9IBbCLQBWCTATCyQA/I6qAKdICBC0QCPDeBPDUQD+KmnkFFQh0BriTg4QkdhtibsDIAAgGIgJgqIg6GPQhiHbjCF8QoXQWw2AAQiuAAi8gcgAS9qlQgVACgUADQjnAYiDA9Qg5AagjAfQgpAagwApQhhBUgoBUQh1D+G3CsIA9AWIBuAXQBVAOBTAFQAxADAwgCQCqgDCEgqQBQgbBDgqICgiNQBjiugBinQgDkIlDgZIgKAAQhPgGhhAIIgXAAQhdAAh0AKgAhNsYQAlAYAgAYIACACQCuCCAlBgQglhgiuiCIgCgCQgggYglgYIjmiJg");
	this.shape_7.setTransform(-6.5913,105.4145);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("EgO/gomQAQgiARghQBAh4B7h4QAqgoA9ggQBaguBagfQH3imGwFgQGwFgBqHkQA0DwgiCrIglDJQgvDMgOA1AUn5IIg0DEQgwDSAOBiQAAACAAACAUn5IQhSgBhMAQADb8xQAADmhjCiQhjCjiLAAQiMAAhkijQhjiiAAjmQAAjnBjiiQBkiiCMAAQCLAABjCiQBjCiAADngAqxrDQF6C/KIidIBAgUQBOgcBMgvQDxiaCNjxIB5AAQAxAQAwARQAjANAiANQAFACAEACQBgAlBcArQAZALAYALQCHBAB3BJQCHBTBxBcQBAA1A4A4QAMAMAMAMQBRBTBABZQBBm4CZl4QEuryGsE8IBlCMQBhCTAVCyQBGI6rNKbICQC0QChDeBZDVQEdKmofFFQiCBrimg3QlJhxiusvIg6GPQhiHajCF9QpuS+1JjEQiNAHjagkQm3hGmIjTQzmqllB8sQiXgtiChQQkCigBviqIBqipQCKjLCcibQHanbIeCQQjchsiGnYQicoiHcn1QDGjTEuAtQEtAtECDNQgBAAAAABQgxBkgkBmQgCAGgCAGQglBpgXBsQhPFkBJG9QBIG8FiDagAaB35IhkDQQg5CCgXBXQgRBBACApAe41TQidhpiag9Qi0hJimgGEAiWgSoQgpgjgpghQgMgJgMgKQg6gsg6goQhFBZhDBrQgUAhgRAeQhdClAOBOEAiWgSoQgiAogiAwQgHALgHALQgMASgMATQgFAJgGAKQh1DDAICREAkLgQ4QgKgLgNgNQgmgmg4gyAXJNIQBQgbBDgpICgiPQBjiugBinQgDkHlDgZQgFAAgFAAQhPgGhhAIQhlgCiDAMQgVABgUADQjnAYiDA+Qg5AZgjAgQgpAZgwAqQhhBUgoBUQh1D+G3CsQAeALAfAMIBuAXQBVAOBTAEQAxADAwgBQCqgDCEgrIBPtIAQ6N0IATtkALjBmIAELOIFTBAA157kQgEDGhPCLQhQCNhuAAQhuAAhKiNQhKiLAEjGQADjHBQiNQBQiLBuAAQBtAABLCLQBKCNgEDHgA/AwfIBVA/QCBBiCBA5QCsBLEJhlQCEgzBihBIAMAYQAQAeAYAfQBLBiB4BFQATAKATAKAl6jvIDmCIQAlAZAgAYIACABQCuCBAlBh");
	this.shape_8.setTransform(0.5418,36.4719);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#FF99FF").s().p("Ag6G7IATtjQAUgDAUgCQCDgLBlABQBhgIBPAGIAKAAQFDAZADEIQABCmhjCuIigCOQhDAqhQAbIBPtIIhPNIQiEAqiqADIggABQggAAgggCgAg6G7IlThAIgErOQCDg9DngYIgTNjIAAAAgAFUGPgArPgvQAohUBhhUQAwgpApgaQAjgfA5gaIAELOQm3itB1j9gAmRlTg");
	this.shape_9.setTransform(114.6445,80.6259);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("EgN4gomQAQgiARghQBAh4B7h4QAqgoA9ggQBaguBagfQH3imGwFgQGwFgBqHkQA0DwgiCrIglDJQgvDMgOA1AVu5IIg0DEQgvDSANBiQAAACAAACAVu5IQhSgBhMAQAEi8xQAADmhjCiQhjCjiLAAQiMAAhkijQhjiiAAjmQAAjnBjiiQBkiiCMAAQCLAABjCiQBjCiAADngApqrDQF6C/KIidIBAgUQBOgcBMgvQDxiaCNjxIB5AAQAxAQAwARQAjANAjANQAEACAEACQBgAlBcArQAZALAYALQCHBAB3BJQCHBTBxBcQBAA1A4A4QANAMALAMQAHAHAGAGAbI35IhkDQQg5CCgXBXQgRBBACApEAiYgIaQBABMA0BRQA6m4CIl4QEOryF9E8IBbCMQBWCTATCyQA/I6qAKbICBC0QCPDeBPDVQD+KmnkFFQh0BriTg3QkdhuibsCAf/1TQidhpiag9Qi0hJimgGEAjUgSoQgegdgegdQAAAAgBgBQgGgEgGgFQgMgJgMgKQg5gsg7goQhFBZhDBrQgUAhgRAeQhdClAOBOEAjUgSoQgeAogeAwQgBACAAACQgGAIgGAKQgMASgMATQgFAJgGAKQh1DDAICREAk9gQ4QgKgLgLgNQgigmgygyEAiWANSQgEgUgFgVIg6GPQhiHajCF9QpuS+1JjEQiNAHjagkQm3hGmIjTQzmqllB8sQiXgtiChQQkCigBviqIBqipQCKjLCcibQHanbIeCQQjchsiGnYQicoiHcn1QDGjTEuAtQEtAtECDNQgBAAAAABQgxBkgkBmQgCAGgCAGQglBpgXBsQhPFkBJG9QBIG8FiDaAYQNIQBQgbBDgpICgiPQBjiugBinQgDkHlDgZQgFAAgFAAQhPgGhhAIQhlgCiDAMQgVABgUADQjnAYiDA+Qg5AZgjAgQgpAZgwAqQhhBUgoBUQh1D+G3CsQAeALAfAMIBuAXQBVAOBTAEQAxADAwgBQCqgDCEgrIBPtIASBN0IATtkAMqBmIAELOIFTBAA0y7kQgEDGhPCLQhQCNhuAAQhuAAhKiNQhKiLAEjGQADjHBQiNQBQiLBuAAQBtAABLCLQBKCNgEDHgA95wfIBVA/QCBBiCBA5QCsBLEJhlQCEgzBihBIAMAYQAQAeAYAfQBLBiB4BFQATAKATAKAkzjvIDmCIQAlAZAgAYIACABQCuCBAlBh");
	this.shape_10.setTransform(-6.5913,36.4719);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_4},{t:this.shape_5},{t:this.shape_7},{t:this.shape_3},{t:this.shape},{t:this.shape_6}]},9).to({state:[{t:this.shape_5},{t:this.shape_4},{t:this.shape_9},{t:this.shape_2},{t:this.shape_8},{t:this.shape}]},11).to({state:[{t:this.shape_4},{t:this.shape_5},{t:this.shape_7},{t:this.shape_9},{t:this.shape},{t:this.shape_10}]},9).to({state:[{t:this.shape_5},{t:this.shape_4},{t:this.shape_9},{t:this.shape_2},{t:this.shape_8},{t:this.shape}]},11).to({state:[{t:this.shape_4},{t:this.shape_5},{t:this.shape_7},{t:this.shape_9},{t:this.shape},{t:this.shape_10}]},9).wait(11));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-344.4,-331.5,689.9,680.3);


(lib.charly_talk = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.charly_mouth_talk();
	this.instance.setTransform(133.95,378,1,1,0,0,0,105.6,54.2);

	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#000000").ss(3,1,1).p("AG0k6Qg5hLhZgzQixhkiEA+QiEA+hTBIQhTBHgkB0IgcBbQg2B+ABCyQAACxCMBX");
	this.shape.setTransform(106.0998,108.1636);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#FFFFFF").ss(3,1,1).p("ANbCrQAABYg+A9Qg+A+hXAAQhYAAg+g+Qg9g9AAhYQAAhXA9g+QA+g9BYAAQBXAAA+A9QA+A+AABXgApyltIjEDTQgohKAEhAQAJh/DfA2g");
	this.shape_1.setTransform(185.1522,125.8321);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().s("rgba(0,0,0,0.839)").ss(2,1,1).p("AGSr/IAYAYQAeAgAeAnQBfCAA3CiQCvIEkgKZQi6j7j2kIQnqoOkug/QFPpnMACZg");
	this.shape_2.setTransform(375.394,420.543);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("EhB2ABAQgJgrgHgnQAaheA4ibQBwk2CWkyQDCmODjlKQFLnhGQlQQGjlhHaipIBegfQB4glCJgiQG0hrGugbQJZgmH0CAQJyChHmHBQBEAvBHA5QDmC3C6DQQJTKZg/KZIBRiMQBlinBoiJQFLm0DiAlIAyBCQA/BUBABgQDLEyCEEtQC4GmAPFeQATG4j4EvQjEAojzgKQnngUjvj7QhHDDiWEaQktI0mKG2QonJkqTERQs2FUuyjWQiogzkDhwQoGjgnIkvQp/mnmooIQoSqLiir9gEgdPgjaQihAThFATQiKAmheBeQktEtD7LxIARAdQAYAjAcAfQBZBkBqAaQFQBQFsq/QAZhHAWhnQAVhogVibQgWibidh/Qifh/ihAUg");
	this.shape_3.setTransform(423.1425,319.5796);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("rgba(255,255,255,0.839)").s().p("AHyFAQg9g9AAhYQAAhXA9g+QA+g9BYAAQBXAAA+A9QA+A+AABXQAABYg+A9Qg+A+hXAAQhYAAg+g+gAtakkQAJh/DfA2IjEDTQgohKAEhAg");
	this.shape_4.setTransform(185.1522,125.8321);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("rgba(0,0,0,0.839)").s().p("AFsN9QhqgZhZhkQgcgggYgjIgRgdQj6rwEsktQBeheCKglQBFgTChgUQChgTCfB+QCdB/AWCcQAVCbgVBmQgWBngZBIQlGJ2kxAAQgjAAgigIgAJbjHQg+A+AABXQAABXA+A9QA+A+BXAAQBYAAA9g+QA+g9AAhXQAAhXg+g+Qg9g+hYAAQhXAAg+A+gAxhigQAAixA1h/IAdhcQAkhzBThIQBShHCFg+QCEg+CyBkQBZAyA4BLQmQFRlLHgQiLhXgBixgArxoCQgFBAAoBKIDEjTQhCgQgvAAQhwAAgGBZg");
	this.shape_5.setTransform(174.7123,148.0475);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#FFFF66").s().p("ABbEcQnqoOkug/QFPpnMACZIAYAYQAeAgAeAnQBfCAA3CiQCvIEkgKZQi6j7j2kIg");
	this.shape_6.setTransform(375.394,420.543);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#FFFF99").s().p("EgQiAwpQiogzkDhwQoGjgnIkvQp/mnmooIQoSqLiir9IgQhSQAaheA4ibQBwk2CWkyQDCmODjlKQFLnhGQlQQGjlhHaipIBegfQB4glCJgiQG0hrGugbQJZgmH0CAQJyChHmHBQBEAvBHA5QDmC3C6DQQJTKZg/KZIBRiMQBlinBoiJQFLm0DiAlIAyBCQA/BUBABgQDLEyCEEtQC4GmAPFeQATG4j4EvQjEAojzgKQnngUjvj7QhHDDiWEaQktI0mKG2QonJkqTERQn6DRomAAQlbAAlthTgAyaLAQEtA/HsIPQD2EHC4D7QEhqZiwoFQg3iihfh/QgcgogeggIgYgXQiagfiIAAQoiAAkMHtgEgdPgjaQihAThFATQiKAmheBeQktEtD7LxIARAdQAYAjAcAfQBZBkBqAaQFQBQFsq/QAZhHAWhnQAVhogVibQgWibidh/QiKhuiLAAQgVAAgWADg");
	this.shape_7.setTransform(423.1425,319.5796);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_7,p:{y:319.5796}},{t:this.shape_6,p:{y:420.543}},{t:this.shape_5,p:{y:148.0475}},{t:this.shape_4,p:{y:125.8321}},{t:this.shape_3,p:{y:319.5796}},{t:this.shape_2,p:{y:420.543}},{t:this.shape_1,p:{y:125.8321}},{t:this.shape,p:{y:108.1636}},{t:this.instance,p:{y:378}}]}).to({state:[{t:this.shape_7,p:{y:315.6296}},{t:this.shape_6,p:{y:416.593}},{t:this.shape_5,p:{y:144.0975}},{t:this.shape_4,p:{y:121.8821}},{t:this.shape_3,p:{y:315.6296}},{t:this.shape_2,p:{y:416.593}},{t:this.shape_1,p:{y:121.8821}},{t:this.shape,p:{y:104.2136}},{t:this.instance,p:{y:378.1}}]},4).to({state:[{t:this.shape_7,p:{y:311.6796}},{t:this.shape_6,p:{y:412.643}},{t:this.shape_5,p:{y:140.1475}},{t:this.shape_4,p:{y:117.9321}},{t:this.shape_3,p:{y:311.6796}},{t:this.shape_2,p:{y:412.643}},{t:this.shape_1,p:{y:117.9321}},{t:this.shape,p:{y:100.2636}},{t:this.instance,p:{y:374.15}}]},4).to({state:[{t:this.shape_7,p:{y:307.7296}},{t:this.shape_6,p:{y:408.693}},{t:this.shape_5,p:{y:136.1975}},{t:this.shape_4,p:{y:113.9821}},{t:this.shape_3,p:{y:307.7296}},{t:this.shape_2,p:{y:408.693}},{t:this.shape_1,p:{y:113.9821}},{t:this.shape,p:{y:96.3136}},{t:this.instance,p:{y:370.2}}]},4).to({state:[{t:this.shape_7,p:{y:303.7796}},{t:this.shape_6,p:{y:404.743}},{t:this.shape_5,p:{y:132.2475}},{t:this.shape_4,p:{y:110.0321}},{t:this.shape_3,p:{y:303.7796}},{t:this.shape_2,p:{y:404.743}},{t:this.shape_1,p:{y:110.0321}},{t:this.shape,p:{y:92.3636}},{t:this.instance,p:{y:366.25}}]},5).to({state:[{t:this.shape_7,p:{y:299.8296}},{t:this.shape_6,p:{y:400.793}},{t:this.shape_5,p:{y:128.2975}},{t:this.shape_4,p:{y:106.0821}},{t:this.shape_3,p:{y:299.8296}},{t:this.shape_2,p:{y:400.793}},{t:this.shape_1,p:{y:106.0821}},{t:this.shape,p:{y:88.4136}},{t:this.instance,p:{y:362.3}}]},4).to({state:[{t:this.shape_7,p:{y:295.8796}},{t:this.shape_6,p:{y:396.843}},{t:this.shape_5,p:{y:124.3475}},{t:this.shape_4,p:{y:102.1321}},{t:this.shape_3,p:{y:295.8796}},{t:this.shape_2,p:{y:396.843}},{t:this.shape_1,p:{y:102.1321}},{t:this.shape,p:{y:84.4636}},{t:this.instance,p:{y:358.35}}]},6).to({state:[{t:this.shape_7,p:{y:291.9296}},{t:this.shape_6,p:{y:392.893}},{t:this.shape_5,p:{y:120.3975}},{t:this.shape_4,p:{y:98.1821}},{t:this.shape_3,p:{y:291.9296}},{t:this.shape_2,p:{y:392.893}},{t:this.shape_1,p:{y:98.1821}},{t:this.shape,p:{y:80.5136}},{t:this.instance,p:{y:354.4}}]},5).to({state:[{t:this.shape_7,p:{y:295.8796}},{t:this.shape_6,p:{y:396.843}},{t:this.shape_5,p:{y:124.3475}},{t:this.shape_4,p:{y:102.1321}},{t:this.shape_3,p:{y:295.8796}},{t:this.shape_2,p:{y:396.843}},{t:this.shape_1,p:{y:102.1321}},{t:this.shape,p:{y:84.4636}},{t:this.instance,p:{y:358.35}}]},5).to({state:[{t:this.shape_7,p:{y:299.8296}},{t:this.shape_6,p:{y:400.793}},{t:this.shape_5,p:{y:128.2975}},{t:this.shape_4,p:{y:106.0821}},{t:this.shape_3,p:{y:299.8296}},{t:this.shape_2,p:{y:400.793}},{t:this.shape_1,p:{y:106.0821}},{t:this.shape,p:{y:88.4136}},{t:this.instance,p:{y:362.3}}]},5).to({state:[{t:this.shape_7,p:{y:303.7796}},{t:this.shape_6,p:{y:404.743}},{t:this.shape_5,p:{y:132.2475}},{t:this.shape_4,p:{y:110.0321}},{t:this.shape_3,p:{y:303.7796}},{t:this.shape_2,p:{y:404.743}},{t:this.shape_1,p:{y:110.0321}},{t:this.shape,p:{y:92.3636}},{t:this.instance,p:{y:366.25}}]},6).to({state:[{t:this.shape_7,p:{y:307.7296}},{t:this.shape_6,p:{y:408.693}},{t:this.shape_5,p:{y:136.1975}},{t:this.shape_4,p:{y:113.9821}},{t:this.shape_3,p:{y:307.7296}},{t:this.shape_2,p:{y:408.693}},{t:this.shape_1,p:{y:113.9821}},{t:this.shape,p:{y:96.3136}},{t:this.instance,p:{y:370.2}}]},4).to({state:[{t:this.shape_7,p:{y:311.6796}},{t:this.shape_6,p:{y:412.643}},{t:this.shape_5,p:{y:140.1475}},{t:this.shape_4,p:{y:117.9321}},{t:this.shape_3,p:{y:311.6796}},{t:this.shape_2,p:{y:412.643}},{t:this.shape_1,p:{y:117.9321}},{t:this.shape,p:{y:100.2636}},{t:this.instance,p:{y:374.15}}]},5).to({state:[{t:this.shape_7,p:{y:315.6296}},{t:this.shape_6,p:{y:416.593}},{t:this.shape_5,p:{y:144.0975}},{t:this.shape_4,p:{y:121.8821}},{t:this.shape_3,p:{y:315.6296}},{t:this.shape_2,p:{y:416.593}},{t:this.shape_1,p:{y:121.8821}},{t:this.shape,p:{y:104.2136}},{t:this.instance,p:{y:378.1}}]},4).wait(4));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1.5,-29.1,849.3,669.8000000000001);


(lib.charly_sailence = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_3
	this.instance = new lib.charly_mouth_sailence();
	this.instance.setTransform(123.25,379.65,1,1,0,0,0,105.6,54.2);

	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#000000").ss(3,1,1).p("AG0k6Qg5hLhZgzQixhkiEA+QiEA+hTBIQhTBHgkB0IgcBbQg2B+ABCyQAACxCMBX");
	this.shape.setTransform(106.0998,108.1636);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#FFFFFF").ss(3,1,1).p("ANbCrQAABYg+A9Qg+A+hXAAQhYAAg+g+Qg9g9AAhYQAAhXA9g+QA+g9BYAAQBXAAA+A9QA+A+AABXgApyltIjEDTQgohKAEhAQAJh/DfA2g");
	this.shape_1.setTransform(185.1522,125.8321);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().s("rgba(0,0,0,0.839)").ss(2,1,1).p("AGSr/IAYAYQAeAgAeAnQBfCAA3CiQCvIEkgKZQi6j7j2kIQnqoOkug/QFPpnMACZg");
	this.shape_2.setTransform(375.394,420.543);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("EAnWgYvQAAAAABABEAnWgYvQgBADACADQBgDDAxDCEApqgSjQBJEHgYEHIBLiMQBfinBgiJQEzm0DSAlIAvBCQA6BUA7BgQC9EyB7EtQCrGmAOFeQASG4jnEvQi2AojigKQnEgUjej7QhBC+iFEQEApoAQ9QgEAHgDAIQhCCUhICMQgCACABAEEAnXAVxQgBAAAAABQjuGEkgFAQonJkqTERQs3FUuxjWQiogzkDhwQoGjgnIkvQp/mnmooIQoSqLiir9QgJgrgIgnQAaheA4ibQBwk2CWkyQDDmODjlKQFLnhGQlQQGjlhHaipIBdgfQB5glCIgiQG1hrGtgbQJYgmH1CAQJzChHmHBQBDAvBIA5QDlC3C6DQQC2DMB5DMEgcHgjaQihAThFATQiKAmhfBeQktEtD7LxIASAdQAXAjAcAfQBaBkBpAaQFRBQFrq/QAZhHAWhnQAWhogWibQgVibieh/Qieh/ihAUg");
	this.shape_3.setTransform(415.9901,319.5796);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("rgba(255,255,255,0.839)").s().p("AHyFAQg9g9AAhYQAAhXA9g+QA+g9BYAAQBXAAA+A9QA+A+AABXQAABYg+A9Qg+A+hXAAQhYAAg+g+gAtakkQAJh/DfA2IjEDTQgohKAEhAg");
	this.shape_4.setTransform(185.1522,125.8321);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("rgba(0,0,0,0.839)").s().p("AFsN9QhqgZhZhkQgcgggYgjIgRgdQj6rwEsktQBeheCKglQBFgTChgUQChgTCfB+QCdB/AWCcQAVCbgVBmQgWBngZBIQlGJ2kxAAQgjAAgigIgAJbjHQg+A+AABXQAABXA+A9QA+A+BXAAQBYAAA9g+QA+g9AAhXQAAhXg+g+Qg9g+hYAAQhXAAg+A+gAxhigQAAixA1h/IAdhcQAkhzBThIQBShHCFg+QCEg+CyBkQBZAyA4BLQmQFRlLHgQiLhXgBixgArxoCQgFBAAoBKIDEjTQhCgQgvAAQhwAAgGBZg");
	this.shape_5.setTransform(174.7123,148.0475);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#FFFF66").s().p("ABbEcQnqoOkug/QFPpnMACZIAYAYQAeAgAeAnQBfCAA3CiQCvIEkgKZQi6j7j2kIg");
	this.shape_6.setTransform(375.394,420.543);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#FFFF99").s().p("EgPaAwpQiogzkDhwQoGjgnIkvQp/mnmooIQoSqLiir9IgRhSQAaheA4ibQBwk2CWkyQDDmODjlKQFLnhGQlQQGjlhHaipIBdgfQB5glCIgiQG1hrGtgbQJYgmH1CAQJzChHmHBQBDAvBIA5QDlC3C6DQQC2DMB5DMIAAACIABAEIgBgEIAAgCIABABIAAAFQBgDDAxDCMAAAAjhIgHAPQhCCUhICMIgBAEIAAACIAAgCIABgEIAAAFIgBABQjuGEkgFAQonJkqTERQn6DRonAAQlaAAlthTgAxTLAQEuA/HrIPQD2EHC5D7QEgqZivoFQg3iihfh/QgegogeggIgXgXQiZgfiJAAQoiAAkMHtgEgcHgjaQihAThFATQiKAmhfBeQktEtD7LxIASAdQAXAjAcAfQBaBkBpAaQFRBQFrq/QAZhHAWhnQAWhogWibQgVibieh/QiJhuiLAAQgWAAgVADgEApqgSjQBJEHgYEHIBLiMQBfinBgiJQEzm0DSAlIAvBCQA6BUA7BgQC9EyB7EtQCrGmAOFeQASG4jnEvQi2AojigKQnEgUjej7QhBC+iFEQg");
	this.shape_7.setTransform(415.9901,319.5796);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f().s("rgba(0,0,0,0.839)").ss(3,1,1).p("EhB2ABAQgJgrgHgnQAaheA4ibQBwk2CWkyQDCmODjlKQFLnhGQlQQGjlhHaipIBegfQB4glCJgiQG0hrGugbQJZgmH0CAQJyChHmHBQBEAvBHA5QDmC3C6DQQBWBhBJBgQGqI4g1I5IBRiMQBlinBoiJQFLm0DiAlIAyBCQA/BUBABgQDLEyCEEtQC4GmAPFeQATG4j4EvQjEAojzgKQnngUjvj7QhHDDiWEaQiSEQimDzQizEEjMDjQonJkqTERQs2FUuyjWQiogzkDhwQoGjgnIkvQp/mnmooIQoSqLiir9gEgdPgjaQihAThFATQiKAmheBeQktEtD7LxIARAdQAYAjAcAfQBZBkBqAaQFQBQFsq/QAZhHAWhnQAVhogVibQgWibidh/Qifh/ihAUg");
	this.shape_8.setTransform(423.1425,318.1796);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#FFFF99").s().p("EgQiAwpQiogzkDhwQoGjgnIkvQp/mnmooIQoSqLiir9IgQhSQAaheA4ibQBwk2CWkyQDCmODjlKQFLnhGQlQQGjlhHaipIBegfQB4glCJgiQG0hrGugbQJZgmH0CAQJyChHmHBQBEAvBHA5QDmC3C6DQQBWBhBJBgQGqI4g1I5IBRiMQBlinBoiJQFLm0DiAlIAyBCQA/BUBABgQDLEyCEEtQC4GmAPFeQATG4j4EvQjEAojzgKQnngUjvj7QhHDDiWEaQiSEQimDzQizEEjMDjQonJkqTERQn6DRomAAQlbAAlthTgAyaLAQEtA/HsIPQD2EHC4D7QEhqZiwoFQg3iihfh/QgcgogeggIgYgXQiagfiIAAQoiAAkMHtgEgdPgjaQihAThFATQiKAmheBeQktEtD7LxIARAdQAYAjAcAfQBZBkBqAaQFQBQFsq/QAZhHAWhnQAVhogVibQgWibidh/QiKhuiLAAQgVAAgWADg");
	this.shape_9.setTransform(423.1425,318.1796);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_7},{t:this.shape_6,p:{y:420.543}},{t:this.shape_5,p:{y:148.0475}},{t:this.shape_4,p:{y:125.8321}},{t:this.shape_3},{t:this.shape_2,p:{y:420.543}},{t:this.shape_1,p:{y:125.8321}},{t:this.shape,p:{y:108.1636}},{t:this.instance,p:{y:379.65}}]}).to({state:[{t:this.shape_9},{t:this.shape_6,p:{y:419.143}},{t:this.shape_5,p:{y:146.6475}},{t:this.shape_4,p:{y:124.4321}},{t:this.shape_8},{t:this.shape_2,p:{y:419.143}},{t:this.shape_1,p:{y:124.4321}},{t:this.shape,p:{y:106.7636}},{t:this.instance,p:{y:378.25}}]},4).to({state:[{t:this.shape_7},{t:this.shape_6,p:{y:420.543}},{t:this.shape_5,p:{y:148.0475}},{t:this.shape_4,p:{y:125.8321}},{t:this.shape_3},{t:this.shape_2,p:{y:420.543}},{t:this.shape_1,p:{y:125.8321}},{t:this.shape,p:{y:108.1636}},{t:this.instance,p:{y:379.65}}]},4).to({state:[{t:this.shape_9},{t:this.shape_6,p:{y:419.143}},{t:this.shape_5,p:{y:146.6475}},{t:this.shape_4,p:{y:124.4321}},{t:this.shape_8},{t:this.shape_2,p:{y:419.143}},{t:this.shape_1,p:{y:124.4321}},{t:this.shape,p:{y:106.7636}},{t:this.instance,p:{y:378.25}}]},4).to({state:[{t:this.shape_7},{t:this.shape_6,p:{y:420.543}},{t:this.shape_5,p:{y:148.0475}},{t:this.shape_4,p:{y:125.8321}},{t:this.shape_3},{t:this.shape_2,p:{y:420.543}},{t:this.shape_1,p:{y:125.8321}},{t:this.shape,p:{y:108.1636}},{t:this.instance,p:{y:379.65}}]},4).to({state:[{t:this.shape_9},{t:this.shape_6,p:{y:419.143}},{t:this.shape_5,p:{y:146.6475}},{t:this.shape_4,p:{y:124.4321}},{t:this.shape_8},{t:this.shape_2,p:{y:419.143}},{t:this.shape_1,p:{y:124.4321}},{t:this.shape,p:{y:106.7636}},{t:this.instance,p:{y:378.25}}]},4).to({state:[{t:this.shape_7},{t:this.shape_6,p:{y:420.543}},{t:this.shape_5,p:{y:148.0475}},{t:this.shape_4,p:{y:125.8321}},{t:this.shape_3},{t:this.shape_2,p:{y:420.543}},{t:this.shape_1,p:{y:125.8321}},{t:this.shape,p:{y:108.1636}},{t:this.instance,p:{y:379.65}}]},5).to({state:[{t:this.shape_9},{t:this.shape_6,p:{y:419.143}},{t:this.shape_5,p:{y:146.6475}},{t:this.shape_4,p:{y:124.4321}},{t:this.shape_8},{t:this.shape_2,p:{y:419.143}},{t:this.shape_1,p:{y:124.4321}},{t:this.shape,p:{y:106.7636}},{t:this.instance,p:{y:378.25}}]},4).to({state:[{t:this.shape_7},{t:this.shape_6,p:{y:420.543}},{t:this.shape_5,p:{y:148.0475}},{t:this.shape_4,p:{y:125.8321}},{t:this.shape_3},{t:this.shape_2,p:{y:420.543}},{t:this.shape_1,p:{y:125.8321}},{t:this.shape,p:{y:108.1636}},{t:this.instance,p:{y:379.65}}]},4).to({state:[{t:this.shape_9},{t:this.shape_6,p:{y:419.143}},{t:this.shape_5,p:{y:146.6475}},{t:this.shape_4,p:{y:124.4321}},{t:this.shape_8},{t:this.shape_2,p:{y:419.143}},{t:this.shape_1,p:{y:124.4321}},{t:this.shape,p:{y:106.7636}},{t:this.instance,p:{y:378.25}}]},4).to({state:[{t:this.shape_7},{t:this.shape_6,p:{y:420.543}},{t:this.shape_5,p:{y:148.0475}},{t:this.shape_4,p:{y:125.8321}},{t:this.shape_3},{t:this.shape_2,p:{y:420.543}},{t:this.shape_1,p:{y:125.8321}},{t:this.shape,p:{y:108.1636}},{t:this.instance,p:{y:379.65}}]},5).to({state:[{t:this.shape_9},{t:this.shape_6,p:{y:419.143}},{t:this.shape_5,p:{y:146.6475}},{t:this.shape_4,p:{y:124.4321}},{t:this.shape_8},{t:this.shape_2,p:{y:419.143}},{t:this.shape_1,p:{y:124.4321}},{t:this.shape,p:{y:106.7636}},{t:this.instance,p:{y:378.25}}]},4).to({state:[{t:this.shape_7},{t:this.shape_6,p:{y:420.543}},{t:this.shape_5,p:{y:148.0475}},{t:this.shape_4,p:{y:125.8321}},{t:this.shape_3},{t:this.shape_2,p:{y:420.543}},{t:this.shape_1,p:{y:125.8321}},{t:this.shape,p:{y:108.1636}},{t:this.instance,p:{y:379.65}}]},4).to({state:[{t:this.shape_9},{t:this.shape_6,p:{y:419.143}},{t:this.shape_5,p:{y:146.6475}},{t:this.shape_4,p:{y:124.4321}},{t:this.shape_8},{t:this.shape_2,p:{y:419.143}},{t:this.shape_1,p:{y:124.4321}},{t:this.shape,p:{y:106.7636}},{t:this.instance,p:{y:378.25}}]},4).to({state:[{t:this.shape_7},{t:this.shape_6,p:{y:420.543}},{t:this.shape_5,p:{y:148.0475}},{t:this.shape_4,p:{y:125.8321}},{t:this.shape_3},{t:this.shape_2,p:{y:420.543}},{t:this.shape_1,p:{y:125.8321}},{t:this.shape,p:{y:108.1636}},{t:this.instance,p:{y:379.65}}]},5).to({state:[{t:this.shape_9},{t:this.shape_6,p:{y:419.143}},{t:this.shape_5,p:{y:146.6475}},{t:this.shape_4,p:{y:124.4321}},{t:this.shape_8},{t:this.shape_2,p:{y:419.143}},{t:this.shape_1,p:{y:124.4321}},{t:this.shape,p:{y:106.7636}},{t:this.instance,p:{y:378.25}}]},4).to({state:[{t:this.shape_7},{t:this.shape_6,p:{y:420.543}},{t:this.shape_5,p:{y:148.0475}},{t:this.shape_4,p:{y:125.8321}},{t:this.shape_3},{t:this.shape_2,p:{y:420.543}},{t:this.shape_1,p:{y:125.8321}},{t:this.shape,p:{y:108.1636}},{t:this.instance,p:{y:379.65}}]},4).to({state:[{t:this.shape_9},{t:this.shape_6,p:{y:419.143}},{t:this.shape_5,p:{y:146.6475}},{t:this.shape_4,p:{y:124.4321}},{t:this.shape_8},{t:this.shape_2,p:{y:419.143}},{t:this.shape_1,p:{y:124.4321}},{t:this.shape,p:{y:106.7636}},{t:this.instance,p:{y:378.25}}]},4).wait(4));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1.5,-2.9,849.3,643.6);


(lib.Scene_1_moshe_talk = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// moshe_talk
	this.instance = new lib.sad_talk();
	this.instance.setTransform(1860.7,1373.3,0.7,0.7,0,0,0,344.4,148.2);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(86).to({_off:false},0).wait(3).to({regY:148.3,scaleX:0.6999,scaleY:0.6999,x:1860.55,y:1372.75},0).wait(3).to({regY:148.5,x:1860.5,y:1372.3},0).wait(3).to({regX:344.5,y:1371.7},0).wait(3).to({regY:148.6,x:1860.45,y:1371.15},0).wait(3).to({regY:148.7,x:1860.4,y:1370.6},0).wait(3).to({regY:148.8,x:1860.35,y:1370.1},0).wait(3).to({scaleX:0.6998,scaleY:0.6998,x:1860.3,y:1369.5},0).wait(3).to({regY:148.9,x:1860.25,y:1368.95},0).wait(3).to({regY:149,x:1860.2,y:1368.4},0).wait(3).to({regX:344.6,regY:149.1,y:1367.9},0).wait(6).to({regX:344.5,regY:148.9,x:1860.25,y:1368.95},0).wait(3).to({regY:148.8,scaleX:0.6999,scaleY:0.6999,x:1860.35,y:1370.1},0).wait(3).to({regY:148.6,x:1860.45,y:1371.15},0).wait(4).to({regX:344.4,regY:148.5,x:1860.5,y:1372.3},0).wait(4).to({regY:148.2,scaleX:0.7,scaleY:0.7,x:1860.7,y:1373.3},0).wait(6).to({regY:148.3,scaleX:0.6999,scaleY:0.6999,x:1860.55,y:1372.75},0).wait(3).to({regY:148.5,x:1860.5,y:1372.3},0).wait(3).to({regX:344.5,y:1371.7},0).wait(3).to({regY:148.6,x:1860.45,y:1371.15},0).wait(3).to({regY:148.7,x:1860.4,y:1370.6},0).wait(3).to({regY:148.8,x:1860.35,y:1370.1},0).wait(3).to({scaleX:0.6998,scaleY:0.6998,x:1860.3,y:1369.5},0).wait(3).to({regY:148.9,x:1860.25,y:1368.95},0).wait(3).to({regY:149,x:1860.2,y:1368.4},0).wait(3).to({regX:344.6,regY:149.1,y:1367.9},0).wait(6).to({regX:344.5,regY:148.9,x:1860.25,y:1368.95},0).wait(3).to({regY:148.8,scaleX:0.6999,scaleY:0.6999,x:1860.35,y:1370.1},0).wait(3).to({regY:148.6,x:1860.45,y:1371.15},0).wait(4).to({regX:344.4,regY:148.5,x:1860.5,y:1372.3},0).wait(4).to({regY:148.2,scaleX:0.7,scaleY:0.7,x:1860.7,y:1373.3},0).wait(6).to({regY:148.3,scaleX:0.6999,scaleY:0.6999,x:1860.55,y:1372.75},0).wait(3).to({regY:148.5,x:1860.5,y:1372.3},0).wait(3).to({regX:344.5,y:1371.7},0).wait(3).to({regY:148.6,x:1860.45,y:1371.15},0).wait(3).to({regY:148.7,x:1860.4,y:1370.6},0).wait(3).to({regY:148.8,x:1860.35,y:1370.1},0).wait(3).to({scaleX:0.6998,scaleY:0.6998,x:1860.3,y:1369.5},0).wait(3).to({regY:148.9,x:1860.25,y:1368.95},0).wait(3).to({regY:149,x:1860.2,y:1368.4},0).wait(3).to({regX:344.6,regY:149.1,y:1367.9},0).wait(6).to({regX:344.5,regY:148.9,x:1860.25,y:1368.95},0).wait(3).to({regY:148.8,scaleX:0.6999,scaleY:0.6999,x:1860.35,y:1370.1},0).wait(3).to({regY:148.6,x:1860.45,y:1371.15},0).wait(4).to({regX:344.4,regY:148.5,x:1860.5,y:1372.3},0).wait(4).to({regY:148.2,scaleX:0.7,scaleY:0.7,x:1860.7,y:1373.3},0).wait(6).to({regY:148.3,scaleX:0.6999,scaleY:0.6999,x:1860.55,y:1372.75},0).wait(3).to({regY:148.5,x:1860.5,y:1372.3},0).wait(3).to({regX:344.5,y:1371.7},0).wait(3).to({regY:148.6,x:1860.45,y:1371.15},0).wait(3).to({regY:148.7,x:1860.4,y:1370.6},0).wait(3).to({regY:148.8,x:1860.35,y:1370.1},0).wait(3).to({scaleX:0.6998,scaleY:0.6998,x:1860.3,y:1369.5},0).wait(3).to({regY:148.9,x:1860.25,y:1368.95},0).wait(3).to({regY:149,x:1860.2,y:1368.4},0).wait(3).to({regX:344.6,regY:149.1,y:1367.9},0).wait(6).to({regX:344.5,regY:148.9,x:1860.25,y:1368.95},0).wait(3).to({regY:148.8,scaleX:0.6999,scaleY:0.6999,x:1860.35,y:1370.1},0).wait(3).to({regX:344.4,regY:148.3,x:1860.55,y:1372.75},0).wait(3).to({regY:148.5,x:1860.5,y:1372.3},0).wait(3).to({regX:344.5,y:1371.7},0).wait(3).to({regY:148.6,x:1860.45,y:1371.15},0).wait(3).to({regY:148.7,x:1860.4,y:1370.6},0).wait(3).to({regY:148.8,x:1860.35,y:1370.1},0).wait(3).to({scaleX:0.6998,scaleY:0.6998,x:1860.3,y:1369.5},0).wait(2).to({regY:148.9,x:1860.25,y:1368.95},0).wait(3).to({regY:149,x:1860.2,y:1368.4},0).wait(3).to({regY:148.7,scaleX:0.6999,scaleY:0.6999,x:1860.4,y:1370.6},0).wait(3));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_moshe_happy = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// moshe_happy
	this.instance = new lib.sad_silent();
	this.instance.setTransform(1619.15,1270,0.7,0.7);

	this.instance_1 = new lib.happy_sailence();
	this.instance_1.setTransform(2103.3,1563.05,0.7,0.7,0,0,0,343.5,274.7);

	this.instance_2 = new lib.happy_talk();
	this.instance_2.setTransform(1853.9,1401.35,0.75,0.75,0,0,0,343.4,310.9);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance}]},368).to({state:[{t:this.instance_1,p:{regX:343.5,regY:274.7,scaleX:0.7,scaleY:0.7,x:2103.3,y:1563.05}}]},22).to({state:[{t:this.instance_2}]},5).to({state:[{t:this.instance_1,p:{regX:0.6,regY:8.8,scaleX:0.75,scaleY:0.75,x:1853.7,y:1381.85}}]},115).wait(34));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_moshe_entrance2 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// moshe_entrance2
	this.instance = new lib.happy_sailence();
	this.instance.setTransform(1853.95,1374.3,0.75,0.75,0,0,0,0.6,0.4);
	this.instance._off = true;

	this.instance_1 = new lib.happy_talk();
	this.instance_1.setTransform(-162.6,1335.75,0.6998,0.6998,0,0,0,437.2,283.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance}]},564).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance}]},100).wait(92));
	this.timeline.addTween(cjs.Tween.get(this.instance).wait(564).to({_off:false},0).wait(1).to({regX:0.5,regY:8.7,scaleX:0.7496,scaleY:0.7496,x:1833.8,y:1370.85},0).wait(1).to({scaleX:0.7493,scaleY:0.7493,x:1814,y:1361.5},0).wait(1).to({scaleX:0.7489,scaleY:0.7489,x:1794.4,y:1352.35},0).wait(1).to({scaleX:0.7485,scaleY:0.7485,x:1774.95,y:1343.4},0).wait(1).to({scaleX:0.7482,scaleY:0.7482,x:1755.65,y:1334.65},0).wait(1).to({scaleX:0.7478,scaleY:0.7478,x:1736.55,y:1326.1},0).wait(1).to({scaleX:0.7474,scaleY:0.7474,x:1717.6,y:1317.75},0).wait(1).to({scaleX:0.7471,scaleY:0.7471,x:1698.8,y:1309.6},0).wait(1).to({scaleX:0.7467,scaleY:0.7467,x:1680.15,y:1301.65},0).wait(1).to({scaleX:0.7463,scaleY:0.7463,x:1661.65,y:1293.9},0).wait(1).to({scaleX:0.746,scaleY:0.746,x:1643.3,y:1286.3},0).wait(1).to({scaleX:0.7456,scaleY:0.7456,x:1625.05,y:1278.9},0).wait(1).to({scaleX:0.7452,scaleY:0.7452,x:1607,y:1271.65},0).wait(1).to({scaleX:0.7449,scaleY:0.7449,x:1589.05,y:1264.6},0).wait(1).to({scaleX:0.7445,scaleY:0.7445,x:1571.2,y:1257.7},0).wait(1).to({scaleX:0.7441,scaleY:0.7441,x:1553.5,y:1250.9},0).wait(1).to({scaleX:0.7438,scaleY:0.7438,x:1535.9,y:1244.3},0).wait(1).to({scaleX:0.7434,scaleY:0.7434,x:1518.45,y:1237.9},0).wait(1).to({scaleX:0.7431,scaleY:0.7431,x:1501.05,y:1231.65},0).wait(1).to({scaleX:0.7427,scaleY:0.7427,x:1483.8,y:1225.55},0).wait(1).to({scaleX:0.7423,scaleY:0.7423,x:1466.7,y:1219.55},0).wait(1).to({scaleX:0.742,scaleY:0.742,x:1449.65,y:1213.75},0).wait(1).to({scaleX:0.7416,scaleY:0.7416,x:1432.7,y:1208.1},0).wait(1).to({scaleX:0.7412,scaleY:0.7412,x:1415.85,y:1202.55},0).wait(1).to({scaleX:0.7409,scaleY:0.7409,x:1399.1,y:1197.2},0).wait(1).to({scaleX:0.7405,scaleY:0.7405,x:1382.45,y:1191.95},0).wait(1).to({scaleX:0.7401,scaleY:0.7401,x:1365.9,y:1186.8},0).wait(1).to({scaleX:0.7398,scaleY:0.7398,x:1349.4,y:1181.85},0).wait(1).to({scaleX:0.7394,scaleY:0.7394,x:1333,y:1177},0).wait(1).to({scaleX:0.739,scaleY:0.739,x:1316.7,y:1172.3},0).wait(1).to({scaleX:0.7387,scaleY:0.7387,x:1300.5,y:1167.75},0).wait(1).to({scaleX:0.7383,scaleY:0.7383,x:1284.35,y:1163.25},0).wait(1).to({scaleX:0.7379,scaleY:0.7379,x:1268.3,y:1158.9},0).wait(1).to({scaleX:0.7376,scaleY:0.7376,x:1252.3,y:1154.7},0).wait(1).to({scaleX:0.7372,scaleY:0.7372,x:1236.4,y:1150.65},0).wait(1).to({scaleX:0.7369,scaleY:0.7369,x:1220.55,y:1146.7},0).wait(1).to({scaleX:0.7365,scaleY:0.7365,x:1204.75,y:1142.9},0).wait(1).to({scaleX:0.7361,scaleY:0.7361,x:1189.05,y:1139.2},0).wait(1).to({scaleX:0.7358,scaleY:0.7358,x:1173.4,y:1135.6},0).wait(1).to({scaleX:0.7354,scaleY:0.7354,x:1157.85,y:1132.15},0).wait(1).to({scaleX:0.735,scaleY:0.735,x:1142.3,y:1128.8},0).wait(1).to({scaleX:0.7347,scaleY:0.7347,x:1126.85,y:1125.55},0).wait(1).to({scaleX:0.7343,scaleY:0.7343,x:1111.5,y:1122.45},0).wait(1).to({scaleX:0.7339,scaleY:0.7339,x:1096.15,y:1119.45},0).wait(1).to({scaleX:0.7336,scaleY:0.7336,x:1080.9,y:1116.55},0).wait(1).to({scaleX:0.7332,scaleY:0.7332,x:1065.65,y:1113.75},0).wait(1).to({scaleX:0.7328,scaleY:0.7328,x:1050.5,y:1111.1},0).wait(1).to({scaleX:0.7325,scaleY:0.7325,x:1035.4,y:1108.5},0).wait(1).to({scaleX:0.7321,scaleY:0.7321,x:1020.35,y:1106.05},0).wait(1).to({scaleX:0.7317,scaleY:0.7317,x:1005.35,y:1103.75},0).wait(1).to({scaleX:0.7314,scaleY:0.7314,x:990.35,y:1101.5},0).wait(1).to({scaleX:0.731,scaleY:0.731,x:975.45,y:1099.4},0).wait(1).to({scaleX:0.7306,scaleY:0.7306,x:960.6,y:1097.4},0).wait(1).to({scaleX:0.7303,scaleY:0.7303,x:945.8,y:1095.5},0).wait(1).to({scaleX:0.7299,scaleY:0.7299,x:931,y:1093.75},0).wait(1).to({scaleX:0.7296,scaleY:0.7296,x:916.3,y:1092.05},0).wait(1).to({scaleX:0.7292,scaleY:0.7292,x:901.6,y:1090.5},0).wait(1).to({scaleX:0.7288,scaleY:0.7288,x:886.95,y:1089},0).wait(1).to({scaleX:0.7285,scaleY:0.7285,x:872.35,y:1087.65},0).wait(1).to({scaleX:0.7281,scaleY:0.7281,x:857.75,y:1086.4},0).wait(1).to({scaleX:0.7277,scaleY:0.7277,x:843.25,y:1085.25},0).wait(1).to({scaleX:0.7274,scaleY:0.7274,x:828.75,y:1084.2},0).wait(1).to({scaleX:0.727,scaleY:0.727,x:814.3,y:1083.2},0).wait(1).to({scaleX:0.7266,scaleY:0.7266,x:799.85,y:1082.4},0).wait(1).to({scaleX:0.7263,scaleY:0.7263,x:785.45,y:1081.65},0).wait(1).to({scaleX:0.7259,scaleY:0.7259,x:771.1,y:1081},0).wait(1).to({scaleX:0.7255,scaleY:0.7255,x:756.8,y:1080.5},0).wait(1).to({scaleX:0.7252,scaleY:0.7252,x:742.5,y:1080.1},0).wait(1).to({scaleX:0.7248,scaleY:0.7248,x:728.2,y:1079.75},0).wait(1).to({scaleX:0.7244,scaleY:0.7244,x:713.95,y:1079.55},0).wait(1).to({scaleX:0.7241,scaleY:0.7241,x:699.75,y:1079.45},0).wait(1).to({scaleX:0.7237,scaleY:0.7237,x:685.55},0).wait(1).to({scaleX:0.7234,scaleY:0.7234,x:671.4,y:1079.55},0).wait(1).to({scaleX:0.723,scaleY:0.723,x:657.25,y:1079.75},0).wait(1).to({scaleX:0.7226,scaleY:0.7226,x:643.15,y:1080.05},0).wait(1).to({scaleX:0.7223,scaleY:0.7223,x:629.05,y:1080.5},0).wait(1).to({scaleX:0.7219,scaleY:0.7219,x:615,y:1081},0).wait(1).to({scaleX:0.7215,scaleY:0.7215,x:600.95,y:1081.65},0).wait(1).to({scaleX:0.7212,scaleY:0.7212,x:586.9,y:1082.3},0).wait(1).to({scaleX:0.7208,scaleY:0.7208,x:572.9,y:1083.15},0).wait(1).to({scaleX:0.7204,scaleY:0.7204,x:558.9,y:1084.1},0).wait(1).to({scaleX:0.7201,scaleY:0.7201,x:544.95,y:1085.15},0).wait(1).to({scaleX:0.7197,scaleY:0.7197,x:530.95,y:1086.3},0).wait(1).to({scaleX:0.7193,scaleY:0.7193,x:517,y:1087.55},0).wait(1).to({scaleX:0.719,scaleY:0.719,x:503.1,y:1088.9},0).wait(1).to({scaleX:0.7186,scaleY:0.7186,x:489.15,y:1090.4},0).wait(1).to({scaleX:0.7182,scaleY:0.7182,x:475.25,y:1091.95},0).wait(1).to({scaleX:0.7179,scaleY:0.7179,x:461.35,y:1093.65},0).wait(1).to({scaleX:0.7175,scaleY:0.7175,x:447.45,y:1095.45},0).wait(1).to({scaleX:0.7171,scaleY:0.7171,x:433.6,y:1097.4},0).wait(1).to({scaleX:0.7168,scaleY:0.7168,x:419.7,y:1099.4},0).wait(1).to({scaleX:0.7164,scaleY:0.7164,x:405.85,y:1101.55},0).wait(1).to({scaleX:0.7161,scaleY:0.7161,x:392,y:1103.8},0).wait(1).to({scaleX:0.7157,scaleY:0.7157,x:378.15,y:1106.15},0).wait(1).to({scaleX:0.7153,scaleY:0.7153,x:364.3,y:1108.55},0).wait(1).to({scaleX:0.715,scaleY:0.715,x:350.45,y:1111.15},0).wait(1).to({scaleX:0.7146,scaleY:0.7146,x:336.6,y:1113.85},0).wait(1).to({scaleX:0.7142,scaleY:0.7142,x:322.75,y:1116.65},0).wait(1).to({scaleX:0.7139,scaleY:0.7139,x:308.9,y:1119.6},0).wait(1).to({scaleX:0.7135,scaleY:0.7135,x:295.05,y:1122.65},0).wait(1).to({scaleX:0.7131,scaleY:0.7131,x:281.2,y:1125.8},0).wait(1).to({scaleX:0.7128,scaleY:0.7128,x:267.35,y:1129.1},0).wait(1).to({scaleX:0.7124,scaleY:0.7124,x:253.5,y:1132.55},0).wait(1).to({scaleX:0.712,scaleY:0.712,x:239.65,y:1136.05},0).wait(1).to({scaleX:0.7117,scaleY:0.7117,x:225.75,y:1139.75},0).wait(1).to({scaleX:0.7113,scaleY:0.7113,x:211.9,y:1143.5},0).wait(1).to({scaleX:0.7109,scaleY:0.7109,x:198,y:1147.45},0).wait(1).to({scaleX:0.7106,scaleY:0.7106,x:184.1,y:1151.45},0).wait(1).to({scaleX:0.7102,scaleY:0.7102,x:170.2,y:1155.65},0).wait(1).to({scaleX:0.7099,scaleY:0.7099,x:156.3,y:1159.95},0).wait(1).to({scaleX:0.7095,scaleY:0.7095,x:142.35,y:1164.35},0).wait(1).to({scaleX:0.7091,scaleY:0.7091,x:128.4,y:1168.9},0).wait(1).to({scaleX:0.7088,scaleY:0.7088,x:114.45,y:1173.6},0).wait(1).to({scaleX:0.7084,scaleY:0.7084,x:100.45,y:1178.45},0).wait(1).to({scaleX:0.708,scaleY:0.708,x:86.45,y:1183.45},0).wait(1).to({scaleX:0.7077,scaleY:0.7077,x:72.4,y:1188.55},0).wait(1).to({scaleX:0.7073,scaleY:0.7073,x:58.35,y:1193.85},0).wait(1).to({scaleX:0.7069,scaleY:0.7069,x:44.3,y:1199.25},0).wait(1).to({scaleX:0.7066,scaleY:0.7066,x:30.2,y:1204.85},0).wait(1).to({scaleX:0.7062,scaleY:0.7062,x:16.05,y:1210.55},0).wait(1).to({scaleX:0.7058,scaleY:0.7058,x:1.9,y:1216.45},0).wait(1).to({scaleX:0.7055,scaleY:0.7055,x:-12.25,y:1222.5},0).wait(1).to({scaleX:0.7051,scaleY:0.7051,x:-26.45,y:1228.65},0).wait(1).to({scaleX:0.7047,scaleY:0.7047,x:-40.7,y:1235.05},0).wait(1).to({scaleX:0.7044,scaleY:0.7044,x:-55,y:1241.55},0).wait(1).to({scaleX:0.704,scaleY:0.704,x:-69.35,y:1248.2},0).wait(1).to({scaleX:0.7036,scaleY:0.7036,x:-83.7,y:1255.05},0).wait(1).to({scaleX:0.7033,scaleY:0.7033,x:-98.1,y:1262.1},0).wait(1).to({scaleX:0.7029,scaleY:0.7029,x:-112.6,y:1269.35},0).wait(1).to({scaleX:0.7026,scaleY:0.7026,x:-127.1,y:1276.75},0).wait(1).to({scaleX:0.7022,scaleY:0.7022,x:-141.65,y:1284.35},0).wait(1).to({scaleX:0.7018,scaleY:0.7018,x:-156.25,y:1292.15},0).wait(1).to({scaleX:0.7015,scaleY:0.7015,x:-170.95,y:1300.15},0).wait(1).to({scaleX:0.7011,scaleY:0.7011,x:-185.65,y:1308.35},0).wait(1).to({scaleX:0.7007,scaleY:0.7007,x:-200.45,y:1316.75},0).wait(1).to({scaleX:0.7004,scaleY:0.7004,x:-215.3,y:1325.35},0).wait(1).to({scaleX:0.7,scaleY:0.7,x:-230.25,y:1334.2},0).wait(1).to({_off:true},1).wait(100).to({_off:false,regX:-0.5,regY:8.8,scaleX:0.6997,scaleY:0.6997,x:-228.95,y:1335.55},0).wait(92));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_moshe_entrance = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// moshe_entrance
	this.instance = new lib.sad_silent();
	this.instance.setTransform(1619.15,1270,0.7,0.7);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1).to({_off:false},0).wait(85));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_moshe = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// moshe
	this.instance = new lib.sad_silent();
	this.instance.setTransform(-231.6,1323.95,0.7,0.7,0,0,0,344.4,148.2);

	this.instance_1 = new lib.happy_sailence();
	this.instance_1.setTransform(-263.85,1346.75,0.7,0.7213,0,0,180,0.5,8.7);

	this.instance_2 = new lib.angry_mouth_sailence();
	this.instance_2.setTransform(-175.1,1414.65,0.6999,0.8679,0,0,180,87,54.6);

	this.instance_3 = new lib.angry();
	this.instance_3.setTransform(-262.3,1327.65,0.6996,0.7497,0,0,180,345.1,370.1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance}]},1024).to({state:[{t:this.instance_1}]},105).to({state:[{t:this.instance_3},{t:this.instance_2}]},102).wait(108));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_charly_talk = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// charly_talk
	this.instance = new lib.sad_silent();
	this.instance.setTransform(1619.15,1270,0.7,0.7);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(316).to({_off:false},0).wait(52));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_charly_entrance = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// charly_entrance
	this.instance = new lib.charly_sailence();
	this.instance.setTransform(3238.9,1851.8,0.4,0.4,0,0,0,423.2,319.8);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(517).to({_off:false},0).wait(1).to({regX:423.1,regY:318.9,x:3230.05,y:1867.55},0).wait(1).to({x:3221.2,y:1882.25},0).wait(1).to({x:3212.25,y:1895.55},0).wait(1).to({x:3203.25,y:1907.65},0).wait(1).to({x:3194.15,y:1918.55},0).wait(1).to({x:3185,y:1928.3},0).wait(1).to({x:3175.7,y:1937},0).wait(1).to({x:3166.35,y:1944.65},0).wait(1).to({x:3156.9,y:1951.35},0).wait(1).to({x:3147.4,y:1957.1},0).wait(1).to({x:3137.75,y:1961.9},0).wait(1).to({x:3128,y:1965.8},0).wait(1).to({x:3118.1,y:1968.85},0).wait(1).to({x:3108.15,y:1971.1},0).wait(1).to({x:3098.05,y:1972.45},0).wait(1).to({x:3087.8,y:1973},0).wait(1).to({x:3077.45,y:1972.8},0).wait(1).to({x:3066.95,y:1971.75},0).wait(1).to({x:3056.35,y:1969.95},0).wait(1).to({x:3045.55,y:1967.3},0).wait(1).to({x:3034.65,y:1963.95},0).wait(1).to({x:3023.55,y:1959.8},0).wait(1).to({x:3012.3,y:1954.85},0).wait(1).to({x:3000.9,y:1949.15},0).wait(1).to({x:2989.3,y:1942.65},0).wait(1).to({x:2977.5,y:1935.35},0).wait(1).to({x:2965.55,y:1927.3},0).wait(1).to({x:2953.35,y:1918.4},0).wait(1).to({x:2941,y:1908.7},0).wait(1).to({x:2928.35,y:1898.15},0).wait(1).to({x:2915.55,y:1886.75},0).wait(1).to({x:2902.45,y:1874.5},0).wait(1).to({x:2889.1,y:1861.35},0).wait(1).to({x:2875.5,y:1847.25},0).wait(1).to({x:2861.6,y:1832.25},0).wait(1).to({x:2847.4,y:1816.2},0).wait(1).to({x:2832.85,y:1799.2},0).wait(1).to({x:2818,y:1781.1},0).wait(1).to({x:2802.75,y:1761.9},0).wait(1).to({x:2787.15,y:1741.5},0).wait(1).to({x:2771.1,y:1719.9},0).wait(1).to({x:2754.65,y:1697},0).wait(1).to({x:2737.65,y:1672.75},0).wait(1).to({x:2720.2,y:1647},0).wait(1).to({x:2702.1,y:1619.65},0).wait(1).to({x:2683.4,y:1590.6},0).wait(1).to({regX:423.2,regY:319.8,x:2683.45,y:1590.95},0).wait(30).to({regY:319.7},0).wait(1).to({regX:423.1,regY:318.9,x:2677.35,y:1579.7},0).wait(1).to({x:2670.9,y:1569},0).wait(1).to({x:2664.1,y:1558.65},0).wait(1).to({x:2656.9,y:1548.55},0).wait(1).to({x:2649.3,y:1538.7},0).wait(1).to({x:2641.4,y:1529.15},0).wait(1).to({x:2633.1,y:1519.85},0).wait(1).to({x:2624.45,y:1510.8},0).wait(1).to({x:2615.45,y:1501.95},0).wait(1).to({x:2606.1,y:1493.4},0).wait(1).to({x:2596.45,y:1485.1},0).wait(1).to({x:2586.4,y:1477},0).wait(1).to({x:2576.05,y:1469.1},0).wait(1).to({x:2565.4,y:1461.45},0).wait(1).to({x:2554.35,y:1454.05},0).wait(1).to({x:2543.05,y:1446.85},0).wait(1).to({x:2531.35,y:1439.85},0).wait(1).to({x:2519.4,y:1433.1},0).wait(1).to({x:2507.1,y:1426.55},0).wait(1).to({x:2494.45,y:1420.2},0).wait(1).to({x:2481.55,y:1414},0).wait(1).to({x:2468.3,y:1408.05},0).wait(1).to({x:2454.75,y:1402.3},0).wait(1).to({x:2440.85,y:1396.75},0).wait(1).to({x:2426.65,y:1391.4},0).wait(1).to({x:2412.2,y:1386.2},0).wait(1).to({x:2397.35,y:1381.25},0).wait(1).to({x:2382.25,y:1376.45},0).wait(1).to({x:2366.85,y:1371.8},0).wait(1).to({x:2351.1,y:1367.4},0).wait(1).to({x:2335.1,y:1363.15},0).wait(1).to({x:2318.75,y:1359.1},0).wait(1).to({x:2302.1,y:1355.2},0).wait(1).to({x:2285.15,y:1351.5},0).wait(1).to({x:2267.9,y:1347.95},0).wait(1).to({x:2250.35,y:1344.6},0).wait(1).to({x:2232.45,y:1341.45},0).wait(1).to({x:2214.25,y:1338.45},0).wait(1).to({x:2195.75,y:1335.6},0).wait(1).to({x:2176.95,y:1332.95},0).wait(1).to({x:2157.85,y:1330.45},0).wait(1).to({x:2138.45,y:1328.15},0).wait(1).to({x:2118.7,y:1326},0).wait(1).to({x:2098.65,y:1324},0).wait(1).to({x:2078.25,y:1322.2},0).wait(1).to({x:2057.6,y:1320.55},0).wait(1).to({x:2036.55,y:1319.1},0).wait(1).to({x:2015.25,y:1317.8},0).wait(1).to({x:1993.6,y:1316.65},0).wait(1).to({x:1971.6,y:1315.65},0).wait(1).to({x:1949.3,y:1314.85},0).wait(1).to({x:1926.65,y:1314.25},0).wait(1).to({x:1903.7,y:1313.75},0).wait(1).to({x:1880.4,y:1313.45},0).wait(1).to({x:1856.75,y:1313.35},0).wait(1).to({x:1832.8},0).wait(1).to({x:1808.45,y:1313.55},0).wait(1).to({x:1783.8,y:1313.95},0).wait(1).to({x:1758.8,y:1314.45},0).wait(1).to({x:1733.4,y:1315.2},0).wait(1).to({x:1707.7,y:1316.05},0).wait(1).to({x:1681.6,y:1317.1},0).wait(1).to({x:1655.15,y:1318.35},0).wait(1).to({x:1628.35,y:1319.75},0).wait(1).to({x:1601.15,y:1321.3},0).wait(1).to({x:1573.6,y:1323.05},0).wait(1).to({x:1545.65,y:1324.95},0).wait(1).to({x:1517.3,y:1327.05},0).wait(1).to({x:1488.6,y:1329.3},0).wait(1).to({x:1459.45,y:1331.75},0).wait(1).to({x:1429.95,y:1334.4},0).wait(1).to({x:1400,y:1337.2},0).wait(1).to({x:1369.65,y:1340.2},0).wait(1).to({x:1338.9,y:1343.35},0).wait(1).to({x:1307.7,y:1346.75},0).wait(1).to({x:1276.1,y:1350.3},0).wait(1).to({x:1244,y:1354},0).wait(1).to({x:1211.5,y:1357.95},0).wait(1).to({x:1178.5,y:1362.1},0).wait(1).to({x:1145.1,y:1366.4},0).wait(1).to({x:1111.2,y:1370.95},0).wait(1).to({x:1076.8,y:1375.65},0).wait(1).to({x:1041.9,y:1380.6},0).wait(1).to({x:1006.55,y:1385.7},0).wait(1).to({x:970.65,y:1391.05},0).wait(1).to({x:934.25,y:1396.65},0).wait(1).to({x:897.3,y:1402.4},0).wait(1).to({x:859.8,y:1408.4},0).wait(1).to({x:821.8,y:1414.65},0).wait(1).to({x:783.2,y:1421.1},0).wait(1).to({x:744,y:1427.75},0).wait(1).to({x:704.25,y:1434.7},0).wait(1).to({x:663.85,y:1441.85},0).wait(1).to({x:622.85,y:1449.25},0).wait(1).to({x:581.2,y:1456.9},0).wait(1).to({x:538.85,y:1464.85},0).wait(1).to({x:495.9,y:1473},0).wait(1).to({x:452.2,y:1481.45},0).wait(1).to({x:407.8,y:1490.15},0).wait(1).to({regX:423.2,regY:319.8,x:407.85,y:1490.55},0).wait(205));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_charly = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// charly
	this.instance = new lib.charly_sailence();
	this.instance.setTransform(407.85,1490.55,0.4,0.4,0,0,0,423.2,319.8);

	this.instance_1 = new lib.charly_talk();
	this.instance_1.setTransform(407.7,1490.9,0.3999,0.3999,0,0,0,424,320.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance,p:{regX:423.2,regY:319.8,scaleX:0.4,scaleY:0.4,x:407.85}}]},1024).to({state:[{t:this.instance_1}]},119).to({state:[{t:this.instance,p:{regX:423.4,regY:319.9,scaleX:0.3999,scaleY:0.3999,x:407.95}}]},89).wait(107));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


// stage content:
(lib.theSEARCH_IdanMoshe = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	this.actionFrames = [0,1,82,325,396,703,822,899,1041,1143,1218,1339];
	this.streamSoundSymbolsList[1] = [{id:"bubble",startFrame:1,endFrame:1339,loop:1,offset:0}];
	this.streamSoundSymbolsList[82] = [{id:"moshe1",startFrame:82,endFrame:322,loop:1,offset:0}];
	this.streamSoundSymbolsList[703] = [{id:"moshe3",startFrame:703,endFrame:822,loop:1,offset:0}];
	this.streamSoundSymbolsList[1218] = [{id:"Sad_TromboneJoe_Lamb665429450",startFrame:1218,endFrame:1339,loop:1,offset:0}];
	this.___GetDepth___ = function(obj) {
		var depth = obj.depth;
		var cameraObj = this.___camera___instance;
		if(cameraObj && cameraObj.depth && obj.isAttachedToCamera)
		{
			depth += depth + cameraObj.depth;
		}
		return depth;
		}
	this.___needSorting___ = function() {
		for (var i = 0; i < this.numChildren - 1; i++)
		{
			var prevDepth = this.___GetDepth___(this.getChildAt(i));
			var nextDepth = this.___GetDepth___(this.getChildAt(i + 1));
			if (prevDepth < nextDepth)
				return true;
		}
		return false;
	}
	this.___sortFunction___ = function(obj1, obj2) {
		return (this.exportRoot.___GetDepth___(obj2) - this.exportRoot.___GetDepth___(obj1));
	}
	this.on('tick', function (event){
		var curTimeline = event.currentTarget;
		if (curTimeline.___needSorting___()){
			this.sortChildren(curTimeline.___sortFunction___);
		}
	});

	// timeline functions:
	this.frame_0 = function() {
		this.clearAllSoundStreams();
		 
		this.start = this.buttoms.start;
		
		var self=this;
		self.stop();
		
		self.start.addEventListener("click", startPlaying);
		
		
		function startPlaying()
		{
			self.gotoAndPlay(1);
		}
	}
	this.frame_1 = function() {
		var soundInstance = playSound("bubble",0);
		this.InsertIntoSoundStreamData(soundInstance,1,1339,1);
		this.start = undefined;
	}
	this.frame_82 = function() {
		var soundInstance = playSound("moshe1",0);
		this.InsertIntoSoundStreamData(soundInstance,82,322,1);
	}
	this.frame_325 = function() {
		playSound("charlicall");
	}
	this.frame_396 = function() {
		playSound("moshe2");
	}
	this.frame_703 = function() {
		var soundInstance = playSound("moshe3",0);
		this.InsertIntoSoundStreamData(soundInstance,703,822,1);
	}
	this.frame_822 = function() {
		playSound("fish1");
	}
	this.frame_899 = function() {
		playSound("SadSoundBiblecom759843766");
	}
	this.frame_1041 = function() {
		playSound("fish2");
	}
	this.frame_1143 = function() {
		playSound("charly");
	}
	this.frame_1218 = function() {
		var soundInstance = playSound("Sad_TromboneJoe_Lamb665429450",0);
		this.InsertIntoSoundStreamData(soundInstance,1218,1339,1);
	}
	this.frame_1339 = function() {
		this.replay = this.buttoms.replay;
		this.___loopingOver___ = true;
		var self=this;
		self.stop();
		
		self.replay.addEventListener("click", playAgain);
		
		function playAgain()
		{	
			self.gotoAndPlay(1); 
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(81).call(this.frame_82).wait(243).call(this.frame_325).wait(71).call(this.frame_396).wait(307).call(this.frame_703).wait(119).call(this.frame_822).wait(77).call(this.frame_899).wait(142).call(this.frame_1041).wait(102).call(this.frame_1143).wait(75).call(this.frame_1218).wait(121).call(this.frame_1339).wait(1));

	// Camera
	this.___camera___instance = new lib.___Camera___();
	this.___camera___instance.name = "___camera___instance";
	this.___camera___instance.setTransform(1134.55,963.15,2.9097,2.9097,0,0,0,0.1,0.1);
	this.___camera___instance.depth = 0;
	this.___camera___instance.visible = false;

	this.timeline.addTween(cjs.Tween.get(this.___camera___instance).wait(19).to({regX:0.3,regY:0.7,x:1134.65,y:963.65},0).wait(1).to({regX:0,regY:0,scaleX:2.8873,scaleY:2.8873,x:1139.5942,y:969.6458},0).wait(1).to({scaleX:2.8649,scaleY:2.8649,x:1145.3885,y:977.6917},0).wait(1).to({scaleX:2.8424,scaleY:2.8424,x:1151.1827,y:985.7375},0).wait(1).to({scaleX:2.82,scaleY:2.82,x:1156.9769,y:993.7833},0).wait(1).to({scaleX:2.7975,scaleY:2.7975,x:1162.7712,y:1001.8292},0).wait(1).to({scaleX:2.7751,scaleY:2.7751,x:1168.5654,y:1009.875},0).wait(1).to({scaleX:2.7527,scaleY:2.7527,x:1174.3596,y:1017.9209},0).wait(1).to({scaleX:2.7302,scaleY:2.7302,x:1180.1539,y:1025.9667},0).wait(1).to({scaleX:2.7078,scaleY:2.7078,x:1185.9481,y:1034.0125},0).wait(1).to({scaleX:2.6853,scaleY:2.6853,x:1191.7423,y:1042.0584},0).wait(1).to({scaleX:2.6629,scaleY:2.6629,x:1197.5366,y:1050.1042},0).wait(1).to({scaleX:2.6405,scaleY:2.6405,x:1203.3308,y:1058.15},0).wait(1).to({scaleX:2.618,scaleY:2.618,x:1209.125,y:1066.1959},0).wait(1).to({scaleX:2.5956,scaleY:2.5956,x:1214.9192,y:1074.2417},0).wait(1).to({scaleX:2.5732,scaleY:2.5732,x:1220.7135,y:1082.2875},0).wait(1).to({scaleX:2.5507,scaleY:2.5507,x:1226.5077,y:1090.3334},0).wait(1).to({scaleX:2.5283,scaleY:2.5283,x:1232.3019,y:1098.3792},0).wait(1).to({scaleX:2.5058,scaleY:2.5058,x:1238.0962,y:1106.425},0).wait(1).to({scaleX:2.4834,scaleY:2.4834,x:1243.8904,y:1114.4709},0).wait(1).to({scaleX:2.461,scaleY:2.461,x:1249.6846,y:1122.5167},0).wait(1).to({scaleX:2.4385,scaleY:2.4385,x:1255.4789,y:1130.5625},0).wait(1).to({scaleX:2.4161,scaleY:2.4161,x:1261.2731,y:1138.6084},0).wait(1).to({scaleX:2.3936,scaleY:2.3936,x:1267.0673,y:1146.6542},0).wait(1).to({scaleX:2.3712,scaleY:2.3712,x:1272.8616,y:1154.7001},0).wait(1).to({scaleX:2.3488,scaleY:2.3488,x:1278.6558,y:1162.7459},0).wait(1).to({scaleX:2.3263,scaleY:2.3263,x:1284.45,y:1170.7917},0).wait(1).to({scaleX:2.3039,scaleY:2.3039,x:1290.2443,y:1178.8376},0).wait(1).to({scaleX:2.2814,scaleY:2.2814,x:1296.0385,y:1186.8834},0).wait(1).to({scaleX:2.259,scaleY:2.259,x:1301.8327,y:1194.9292},0).wait(1).to({scaleX:2.2366,scaleY:2.2366,x:1307.627,y:1202.9751},0).wait(1).to({scaleX:2.2141,scaleY:2.2141,x:1313.4212,y:1211.0209},0).wait(1).to({scaleX:2.1917,scaleY:2.1917,x:1319.2154,y:1219.0667},0).wait(1).to({scaleX:2.1692,scaleY:2.1692,x:1325.0097,y:1227.1126},0).wait(1).to({scaleX:2.1468,scaleY:2.1468,x:1330.8039,y:1235.1584},0).wait(1).to({scaleX:2.1244,scaleY:2.1244,x:1336.5981,y:1243.2042},0).wait(1).to({scaleX:2.1019,scaleY:2.1019,x:1342.3923,y:1251.2501},0).wait(1).to({scaleX:2.0795,scaleY:2.0795,x:1348.1866,y:1259.2959},0).wait(1).to({scaleX:2.057,scaleY:2.057,x:1353.9808,y:1267.3418},0).wait(1).to({scaleX:2.0346,scaleY:2.0346,x:1359.775,y:1275.3876},0).wait(1).to({scaleX:2.0122,scaleY:2.0122,x:1365.5693,y:1283.4334},0).wait(1).to({scaleX:1.9897,scaleY:1.9897,x:1371.3635,y:1291.4793},0).wait(1).to({scaleX:1.9673,scaleY:1.9673,x:1377.1577,y:1299.5251},0).wait(1).to({scaleX:1.9449,scaleY:1.9449,x:1382.952,y:1307.5709},0).wait(1).to({scaleX:1.9224,scaleY:1.9224,x:1388.7462,y:1315.6168},0).wait(1).to({scaleX:1.9,scaleY:1.9,x:1394.5404,y:1323.6626},0).wait(1).to({scaleX:1.8775,scaleY:1.8775,x:1400.3347,y:1331.7084},0).wait(1).to({scaleX:1.8551,scaleY:1.8551,x:1406.1289,y:1339.7543},0).wait(1).to({scaleX:1.8327,scaleY:1.8327,x:1411.9231,y:1347.8001},0).wait(1).to({scaleX:1.8102,scaleY:1.8102,x:1417.7174,y:1355.8459},0).wait(1).to({scaleX:1.7878,scaleY:1.7878,x:1423.5116,y:1363.8918},0).wait(1).to({scaleX:1.7653,scaleY:1.7653,x:1429.3058,y:1371.9376},0).wait(1).to({scaleX:1.7429,scaleY:1.7429,x:1435.1001,y:1379.9835},0).wait(1).to({scaleX:1.7205,scaleY:1.7205,x:1440.8943,y:1388.0293},0).wait(1).to({scaleX:1.698,scaleY:1.698,x:1446.6885,y:1396.0751},0).wait(1).to({scaleX:1.6756,scaleY:1.6756,x:1452.4827,y:1404.121},0).wait(1).to({scaleX:1.6531,scaleY:1.6531,x:1458.277,y:1412.1668},0).wait(1).to({regX:0.1,regY:0.2,scaleX:1.6067,scaleY:1.6067,x:1460.35,y:1416.95},0).wait(292).to({regX:0.2,regY:0.4,x:1460.45,y:1417.25},0).wait(1).to({regX:0,regY:0,scaleX:1.514,scaleY:1.514,x:1486.7032,y:1404.2247},0).wait(1).to({scaleX:1.4213,scaleY:1.4213,x:1513.2564,y:1391.8495},0).wait(1).to({scaleX:1.3286,scaleY:1.3286,x:1539.8096,y:1379.4742},0).wait(1).to({scaleX:1.2359,scaleY:1.2359,x:1566.3628,y:1367.099},0).wait(1).to({scaleX:1.1432,scaleY:1.1432,x:1592.916,y:1354.7237},0).wait(1).to({scaleX:1.0505,scaleY:1.0505,x:1619.4692,y:1342.3485},0).wait(1).to({scaleX:0.9965,scaleY:0.9965,x:1634.9586,y:1335.1296},0).wait(1).to({scaleX:0.9424,scaleY:0.9424,x:1650.4479,y:1327.9107},0).wait(1).to({scaleX:0.8883,scaleY:0.8883,x:1665.9372,y:1320.6918},0).wait(1).to({scaleX:0.8342,scaleY:0.8342,x:1681.4265,y:1313.4729},0).wait(1).to({scaleX:0.7802,scaleY:0.7802,x:1696.9158,y:1306.254},0).wait(1).to({scaleX:0.7261,scaleY:0.7261,x:1712.4051,y:1299.0351},0).wait(1).to({scaleX:0.672,scaleY:0.672,x:1727.8944,y:1291.8162},0).wait(1).to({scaleX:0.6179,scaleY:0.6179,x:1743.3838,y:1284.5973},0).wait(1).to({scaleX:0.5639,scaleY:0.5639,x:1758.8731,y:1277.3785},0).wait(1).to({scaleX:0.5098,scaleY:0.5098,x:1774.3624,y:1270.1596},0).wait(1).to({scaleX:0.4557,scaleY:0.4557,x:1789.8517,y:1262.9407},0).wait(1).to({scaleX:0.4016,scaleY:0.4016,x:1805.341,y:1255.7218},0).wait(1).to({scaleX:0.4956,scaleY:0.4956,x:1817.1449,y:1276.3798},0).wait(1).to({scaleX:0.5897,scaleY:0.5897,x:1828.9489,y:1297.0378},0).wait(1).to({scaleX:0.6837,scaleY:0.6837,x:1840.7528,y:1317.6958},0).wait(1).to({scaleX:0.7777,scaleY:0.7777,x:1852.5567,y:1338.3538},0).wait(1).to({scaleX:0.8717,scaleY:0.8717,x:1864.3606,y:1359.0118},0).wait(1).to({scaleX:0.9657,scaleY:0.9657,x:1876.1646,y:1379.6698},0).wait(1).to({scaleX:1.0597,scaleY:1.0597,x:1887.9685,y:1400.3278},0).wait(1).to({scaleX:1.1538,scaleY:1.1538,x:1899.7724,y:1420.9858},0).wait(1).to({scaleX:1.2478,scaleY:1.2478,x:1911.5763,y:1441.6438},0).wait(1).to({scaleX:1.3418,scaleY:1.3418,x:1923.3803,y:1462.3018},0).wait(1).to({scaleX:1.4358,scaleY:1.4358,x:1935.1842,y:1482.9598},0).wait(117).to({scaleX:1.4115,scaleY:1.4115,x:1955.864,y:1486.175},0).wait(1).to({scaleX:1.3872,scaleY:1.3872,x:1976.5439,y:1489.3902},0).wait(1).to({scaleX:1.3629,scaleY:1.3629,x:1997.2238,y:1492.6054},0).wait(1).to({scaleX:1.3385,scaleY:1.3385,x:2017.9036,y:1495.8205},0).wait(1).to({scaleX:1.3142,scaleY:1.3142,x:2038.5835,y:1499.0357},0).wait(1).to({scaleX:1.2899,scaleY:1.2899,x:2059.2634,y:1502.2509},0).wait(1).to({scaleX:1.2656,scaleY:1.2656,x:2079.9432,y:1505.4661},0).wait(1).to({scaleX:1.2413,scaleY:1.2413,x:2100.6231,y:1508.6812},0).wait(1).to({scaleX:1.2169,scaleY:1.2169,x:2121.303,y:1511.8964},0).wait(1).to({scaleX:1.1926,scaleY:1.1926,x:2141.9828,y:1515.1116},0).wait(1).to({scaleX:1.1683,scaleY:1.1683,x:2162.6627,y:1518.3268},0).wait(1).to({scaleX:1.144,scaleY:1.144,x:2183.3425,y:1521.542},0).wait(1).to({scaleX:1.1197,scaleY:1.1197,x:2204.0224,y:1524.7571},0).wait(1).to({scaleX:1.0953,scaleY:1.0953,x:2224.7023,y:1527.9723},0).wait(1).to({scaleX:1.071,scaleY:1.071,x:2245.3821,y:1531.1875},0).wait(1).to({scaleX:1.0467,scaleY:1.0467,x:2266.062,y:1534.4027},0).wait(1).to({scaleX:1.0224,scaleY:1.0224,x:2286.7419,y:1537.6179},0).wait(1).to({scaleX:0.9981,scaleY:0.9981,x:2307.4217,y:1540.833},0).wait(1).to({scaleX:0.9738,scaleY:0.9738,x:2328.1016,y:1544.0482},0).wait(1).to({scaleX:0.9494,scaleY:0.9494,x:2348.7815,y:1547.2634},0).wait(1).to({scaleX:0.9251,scaleY:0.9251,x:2369.4613,y:1550.4786},0).wait(1).to({scaleX:0.9008,scaleY:0.9008,x:2390.1412,y:1553.6937},0).wait(1).to({scaleX:0.8765,scaleY:0.8765,x:2410.8211,y:1556.9089},0).wait(1).to({scaleX:0.8522,scaleY:0.8522,x:2431.5009,y:1560.1241},0).wait(1).to({scaleX:0.8278,scaleY:0.8278,x:2452.1808,y:1563.3393},0).wait(1).to({scaleX:0.8035,scaleY:0.8035,x:2472.8606,y:1566.5545},0).wait(1).to({scaleX:0.7792,scaleY:0.7792,x:2493.5405,y:1569.7696},0).wait(1).to({scaleX:0.7549,scaleY:0.7549,x:2514.2204,y:1572.9848},0).wait(1).to({scaleX:0.7306,scaleY:0.7306,x:2534.9002,y:1576.2},0).wait(1).to({scaleX:0.7062,scaleY:0.7062,x:2555.5801,y:1579.4152},0).wait(1).to({x:2555.0866,y:1583.113},0).wait(1).to({x:2554.5931,y:1586.8108},0).wait(1).to({x:2554.0997,y:1590.5087},0).wait(1).to({x:2553.6062,y:1594.2065},0).wait(1).to({x:2553.1127,y:1597.9043},0).wait(1).to({x:2552.6192,y:1601.6021},0).wait(1).to({x:2552.1258,y:1605.3},0).wait(1).to({x:2551.6323,y:1608.9978},0).wait(1).to({x:2551.1388,y:1612.6956},0).wait(1).to({x:2550.6453,y:1616.3934},0).wait(1).to({x:2550.1518,y:1620.0913},0).wait(1).to({x:2549.6584,y:1623.7891},0).wait(1).to({x:2549.1649,y:1627.4869},0).wait(1).to({x:2548.6714,y:1631.1847},0).wait(1).to({x:2548.1779,y:1634.8826},0).wait(1).to({x:2547.6844,y:1638.5804},0).wait(1).to({x:2547.191,y:1642.2782},0).wait(1).to({x:2546.6975,y:1645.976},0).wait(1).to({x:2546.204,y:1649.6739},0).wait(1).to({x:2545.7105,y:1653.3717},0).wait(1).to({x:2545.2171,y:1657.0695},0).wait(1).to({x:2544.7236,y:1660.7673},0).wait(1).to({x:2544.2301,y:1664.4652},0).wait(1).to({scaleX:0.7181,scaleY:0.7181,x:2439.5405,y:1622.6029},0).wait(1).to({scaleX:0.73,scaleY:0.73,x:2334.8509,y:1580.7407},0).wait(1).to({scaleX:0.7418,scaleY:0.7418,x:2230.1612,y:1538.8784},0).wait(1).to({scaleX:0.7537,scaleY:0.7537,x:2125.4716,y:1497.0162},0).wait(1).to({scaleX:0.7655,scaleY:0.7655,x:2020.782,y:1455.1539},0).wait(1).to({scaleX:0.7774,scaleY:0.7774,x:1916.0924,y:1413.2917},0).wait(1).to({scaleX:0.7893,scaleY:0.7893,x:1811.4027,y:1371.4294},0).wait(1).to({scaleX:0.8011,scaleY:0.8011,x:1706.7131,y:1329.5672},0).wait(1).to({scaleX:0.813,scaleY:0.813,x:1689.2866,y:1327.8859},0).wait(1).to({scaleX:0.8248,scaleY:0.8248,x:1671.86,y:1326.2047},0).wait(1).to({scaleX:0.8367,scaleY:0.8367,x:1654.4335,y:1324.5235},0).wait(1).to({scaleX:0.8486,scaleY:0.8486,x:1637.0069,y:1322.8422},0).wait(1).to({scaleX:0.8604,scaleY:0.8604,x:1619.5804,y:1321.161},0).wait(1).to({scaleX:0.8723,scaleY:0.8723,x:1602.1538,y:1319.4798},0).wait(1).to({scaleX:0.8842,scaleY:0.8842,x:1584.7273,y:1317.7985},0).wait(1).to({scaleX:0.896,scaleY:0.896,x:1567.3007,y:1316.1173},0).wait(1).to({scaleX:0.9079,scaleY:0.9079,x:1549.8742,y:1314.4361},0).wait(1).to({scaleX:0.9197,scaleY:0.9197,x:1532.4477,y:1312.7548},0).wait(1).to({scaleX:0.9316,scaleY:0.9316,x:1515.0211,y:1311.0736},0).wait(1).to({scaleX:0.9435,scaleY:0.9435,x:1497.5946,y:1309.3924},0).wait(1).to({scaleX:0.9553,scaleY:0.9553,x:1480.168,y:1307.7111},0).wait(1).to({scaleX:0.9672,scaleY:0.9672,x:1462.7415,y:1306.0299},0).wait(1).to({scaleX:0.979,scaleY:0.979,x:1445.3149,y:1304.3487},0).wait(1).to({scaleX:0.9909,scaleY:0.9909,x:1427.8884,y:1302.6674},0).wait(1).to({scaleX:1.0028,scaleY:1.0028,x:1410.4618,y:1300.9862},0).wait(1).to({scaleX:1.0146,scaleY:1.0146,x:1393.0353,y:1299.305},0).wait(1).to({scaleX:1.0265,scaleY:1.0265,x:1375.6087,y:1297.6237},0).wait(1).to({scaleX:1.0383,scaleY:1.0383,x:1358.1822,y:1295.9425},0).wait(1).to({scaleX:1.0502,scaleY:1.0502,x:1340.7556,y:1294.2613},0).wait(1).to({scaleX:1.0621,scaleY:1.0621,x:1323.3291,y:1292.58},0).wait(1).to({scaleX:1.0739,scaleY:1.0739,x:1305.9025,y:1290.8988},0).wait(1).to({scaleX:1.0858,scaleY:1.0858,x:1288.476,y:1289.2176},0).wait(1).to({scaleX:1.0977,scaleY:1.0977,x:1271.0495,y:1287.5363},0).wait(1).to({scaleX:1.1095,scaleY:1.1095,x:1253.6229,y:1285.8551},0).wait(1).to({scaleX:1.1214,scaleY:1.1214,x:1236.1964,y:1284.1739},0).wait(1).to({scaleX:1.1332,scaleY:1.1332,x:1218.7698,y:1282.4926},0).wait(1).to({scaleX:1.1451,scaleY:1.1451,x:1201.3433,y:1280.8114},0).wait(1).to({scaleX:1.157,scaleY:1.157,x:1183.9167,y:1279.1302},0).wait(1).to({scaleX:1.1688,scaleY:1.1688,x:1166.4902,y:1277.4489},0).wait(1).to({scaleX:1.1807,scaleY:1.1807,x:1149.0636,y:1275.7677},0).wait(1).to({scaleX:1.1925,scaleY:1.1925,x:1131.6371,y:1274.0865},0).wait(1).to({scaleX:1.2044,scaleY:1.2044,x:1114.2105,y:1272.4052},0).wait(1).to({scaleX:1.2163,scaleY:1.2163,x:1096.784,y:1270.724},0).wait(1).to({scaleX:1.2281,scaleY:1.2281,x:1079.3574,y:1269.0428},0).wait(1).to({scaleX:1.24,scaleY:1.24,x:1061.9309,y:1267.3615},0).wait(1).to({scaleX:1.2518,scaleY:1.2518,x:1044.5043,y:1265.6803},0).wait(1).to({scaleX:1.2637,scaleY:1.2637,x:1027.0778,y:1263.9991},0).wait(1).to({scaleX:1.2756,scaleY:1.2756,x:1009.6513,y:1262.3178},0).wait(1).to({scaleX:1.2874,scaleY:1.2874,x:992.2247,y:1260.6366},0).wait(1).to({scaleX:1.2993,scaleY:1.2993,x:974.7982,y:1258.9554},0).wait(1).to({scaleX:1.3112,scaleY:1.3112,x:957.3716,y:1257.2741},0).wait(1).to({scaleX:1.323,scaleY:1.323,x:939.9451,y:1255.5929},0).wait(1).to({scaleX:1.3349,scaleY:1.3349,x:922.5185,y:1253.9117},0).wait(1).to({scaleX:1.3467,scaleY:1.3467,x:905.092,y:1252.2304},0).wait(1).to({scaleX:1.3586,scaleY:1.3586,x:887.6654,y:1250.5492},0).wait(1).to({scaleX:1.3705,scaleY:1.3705,x:870.2389,y:1248.868},0).wait(1).to({scaleX:1.3823,scaleY:1.3823,x:852.8123,y:1247.1867},0).wait(1).to({scaleX:1.3942,scaleY:1.3942,x:835.3858,y:1245.5055},0).wait(1).to({scaleX:1.406,scaleY:1.406,x:817.9592,y:1243.8243},0).wait(1).to({scaleX:1.4179,scaleY:1.4179,x:800.5327,y:1242.143},0).wait(1).to({scaleX:1.4298,scaleY:1.4298,x:783.1061,y:1240.4618},0).wait(1).to({scaleX:1.4416,scaleY:1.4416,x:765.6796,y:1238.7806},0).wait(1).to({scaleX:1.4535,scaleY:1.4535,x:748.2531,y:1237.0993},0).wait(1).to({scaleX:1.4653,scaleY:1.4653,x:730.8265,y:1235.4181},0).wait(1).to({scaleX:1.4772,scaleY:1.4772,x:713.4,y:1233.7369},0).wait(1).to({scaleX:1.4891,scaleY:1.4891,x:695.9734,y:1232.0556},0).wait(1).to({scaleX:1.5009,scaleY:1.5009,x:678.5469,y:1230.3744},0).wait(1).to({scaleX:1.5128,scaleY:1.5128,x:661.1203,y:1228.6932},0).wait(1).to({scaleX:1.5246,scaleY:1.5246,x:643.6938,y:1227.0119},0).wait(1).to({scaleX:1.5365,scaleY:1.5365,x:626.2672,y:1225.3307},0).wait(1).to({scaleX:1.5484,scaleY:1.5484,x:608.8407,y:1223.6495},0).wait(1).to({scaleX:1.5602,scaleY:1.5602,x:591.4141,y:1221.9682},0).wait(1).to({scaleX:1.5721,scaleY:1.5721,x:573.9876,y:1220.287},0).wait(1).to({scaleX:1.584,scaleY:1.584,x:556.561,y:1218.6058},0).wait(1).to({scaleX:1.5958,scaleY:1.5958,x:539.1345,y:1216.9245},0).wait(1).to({scaleX:1.6077,scaleY:1.6077,x:521.7079,y:1215.2433},0).wait(1).to({scaleX:1.6195,scaleY:1.6195,x:504.2814,y:1213.5621},0).wait(1).to({scaleX:1.6314,scaleY:1.6314,x:486.8549,y:1211.8808},0).wait(1).to({scaleX:1.6433,scaleY:1.6433,x:469.4283,y:1210.1996},0).wait(1).to({scaleX:1.6551,scaleY:1.6551,x:452.0018,y:1208.5184},0).wait(1).to({scaleX:1.667,scaleY:1.667,x:434.5752,y:1206.8371},0).wait(1).to({scaleX:1.6788,scaleY:1.6788,x:417.1487,y:1205.1559},0).wait(1).to({scaleX:1.6907,scaleY:1.6907,x:399.7221,y:1203.4747},0).wait(1).to({scaleX:1.7026,scaleY:1.7026,x:382.2956,y:1201.7934},0).wait(1).to({scaleX:1.7144,scaleY:1.7144,x:364.869,y:1200.1122},0).wait(1).to({scaleX:1.7263,scaleY:1.7263,x:347.4425,y:1198.431},0).wait(1).to({scaleX:1.7381,scaleY:1.7381,x:330.0159,y:1196.7497},0).wait(1).to({scaleX:1.75,scaleY:1.75,x:312.5894,y:1195.0685},0).wait(1).to({scaleX:1.7619,scaleY:1.7619,x:295.1628,y:1193.3873},0).wait(1).to({scaleX:1.7737,scaleY:1.7737,x:277.7363,y:1191.706},0).wait(1).to({scaleX:1.7856,scaleY:1.7856,x:260.3097,y:1190.0248},0).wait(1).to({scaleX:1.7975,scaleY:1.7975,x:242.8832,y:1188.3436},0).wait(1).to({scaleX:1.8093,scaleY:1.8093,x:225.4567,y:1186.6623},0).wait(1).to({scaleX:1.8212,scaleY:1.8212,x:208.0301,y:1184.9811},0).wait(1).to({scaleX:1.833,scaleY:1.833,x:190.6036,y:1183.2999},0).wait(1).to({scaleX:1.8449,scaleY:1.8449,x:173.177,y:1181.6186},0).wait(1).to({scaleX:1.8568,scaleY:1.8568,x:155.7505,y:1179.9374},0).wait(1).to({scaleX:1.8686,scaleY:1.8686,x:138.3239,y:1178.2562},0).wait(1).to({scaleX:1.8805,scaleY:1.8805,x:120.8974,y:1176.5749},0).wait(1).to({scaleX:1.8923,scaleY:1.8923,x:103.4708,y:1174.8937},0).wait(1).to({scaleX:1.9042,scaleY:1.9042,x:86.0443,y:1173.2125},0).wait(1).to({scaleX:1.9161,scaleY:1.9161,x:68.6177,y:1171.5312},0).wait(1).to({scaleX:1.9279,scaleY:1.9279,x:51.1912,y:1169.85},0).wait(1).to({scaleX:1.9398,scaleY:1.9398,x:33.7646,y:1168.1688},0).wait(1).to({scaleX:1.9516,scaleY:1.9516,x:16.3381,y:1166.4875},0).wait(1).to({scaleX:1.9635,scaleY:1.9635,x:-1.0885,y:1164.8063},0).wait(1).to({scaleX:1.9754,scaleY:1.9754,x:-18.515,y:1163.1251},0).wait(1).to({scaleX:1.9872,scaleY:1.9872,x:-35.9415,y:1161.4438},0).wait(1).to({scaleX:1.9991,scaleY:1.9991,x:-53.3681,y:1159.7626},0).wait(1).to({scaleX:2.011,scaleY:2.011,x:-70.7946,y:1158.0814},0).wait(1).to({scaleX:2.0228,scaleY:2.0228,x:-88.2212,y:1156.4001},0).wait(1).to({scaleX:2.0347,scaleY:2.0347,x:-105.6477,y:1154.7189},0).wait(1).to({scaleX:2.0465,scaleY:2.0465,x:-123.0743,y:1153.0377},0).wait(1).to({scaleX:2.0584,scaleY:2.0584,x:-140.5008,y:1151.3564},0).wait(1).to({scaleX:2.0703,scaleY:2.0703,x:-157.9274,y:1149.6752},0).wait(1).to({scaleX:2.0821,scaleY:2.0821,x:-175.3539,y:1147.994},0).wait(1).to({scaleX:2.094,scaleY:2.094,x:-192.7805,y:1146.3127},0).wait(1).to({scaleX:2.1058,scaleY:2.1058,x:-210.207,y:1144.6315},0).wait(1).to({scaleX:2.1177,scaleY:2.1177,x:-227.6336,y:1142.9503},0).wait(1).to({scaleX:2.1296,scaleY:2.1296,x:-245.0601,y:1141.269},0).wait(1).to({scaleX:2.1414,scaleY:2.1414,x:-262.4867,y:1139.5878},0).wait(1).to({scaleX:2.1533,scaleY:2.1533,x:-279.9132,y:1137.9066},0).wait(1).to({scaleX:2.1651,scaleY:2.1651,x:-297.3397,y:1136.2253},0).wait(1).to({scaleX:2.177,scaleY:2.177,x:-314.7663,y:1134.5441},0).wait(1).to({scaleX:2.1889,scaleY:2.1889,x:-332.1928,y:1132.8629},0).wait(1).to({scaleX:2.2007,scaleY:2.2007,x:-349.6194,y:1131.1816},0).wait(1).to({scaleX:2.2126,scaleY:2.2126,x:-367.0459,y:1129.5004},0).wait(1).to({scaleX:2.2245,scaleY:2.2245,x:-384.4725,y:1127.8192},0).wait(1).to({scaleX:2.2363,scaleY:2.2363,x:-401.899,y:1126.1379},0).wait(1).to({scaleX:2.2482,scaleY:2.2482,x:-419.3256,y:1124.4567},0).wait(1).to({scaleX:2.26,scaleY:2.26,x:-436.7521,y:1122.7755},0).wait(1).to({scaleX:2.2719,scaleY:2.2719,x:-454.1787,y:1121.0942},0).wait(1).to({scaleX:2.2838,scaleY:2.2838,x:-471.6052,y:1119.413},0).wait(1).to({scaleX:2.2956,scaleY:2.2956,x:-489.0318,y:1117.7318},0).wait(1).to({scaleX:2.3075,scaleY:2.3075,x:-506.4583,y:1116.0505},0).wait(1).to({scaleX:2.3193,scaleY:2.3193,x:-523.8849,y:1114.3693},0).wait(1).to({scaleX:2.3312,scaleY:2.3312,x:-541.3114,y:1112.6881},0).wait(1).to({scaleX:2.3431,scaleY:2.3431,x:-558.7379,y:1111.0068},0).wait(1).to({scaleX:2.3549,scaleY:2.3549,x:-576.1645,y:1109.3256},0).wait(1).to({scaleX:2.3668,scaleY:2.3668,x:-593.591,y:1107.6444},0).wait(1).to({scaleX:2.3786,scaleY:2.3786,x:-611.0176,y:1105.9631},0).wait(1).to({scaleX:2.3905,scaleY:2.3905,x:-628.4441,y:1104.2819},0).wait(1).to({scaleX:2.4024,scaleY:2.4024,x:-645.8707,y:1102.6007},0).wait(1).to({scaleX:2.4142,scaleY:2.4142,x:-663.2972,y:1100.9194},0).wait(1).to({scaleX:2.4261,scaleY:2.4261,x:-680.7238,y:1099.2382},0).wait(1).to({scaleX:2.4379,scaleY:2.4379,x:-698.1503,y:1097.557},0).wait(1).to({scaleX:2.4498,scaleY:2.4498,x:-715.5769,y:1095.8757},0).wait(1).to({scaleX:2.4617,scaleY:2.4617,x:-733.0034,y:1094.1945},0).wait(1).to({scaleX:2.4735,scaleY:2.4735,x:-750.43,y:1092.5133},0).wait(1).to({scaleX:2.4854,scaleY:2.4854,x:-767.8565,y:1090.832},0).wait(1).to({scaleX:2.4973,scaleY:2.4973,x:-785.2831,y:1089.1508},0).wait(1).to({scaleX:2.5091,scaleY:2.5091,x:-802.7096,y:1087.4696},0).wait(1).to({scaleX:2.521,scaleY:2.521,x:-820.1362,y:1085.7883},0).wait(1).to({scaleX:2.5328,scaleY:2.5328,x:-837.5627,y:1084.1071},0).wait(1).to({scaleX:2.5447,scaleY:2.5447,x:-854.9892,y:1082.4259},0).wait(1).to({scaleX:2.5566,scaleY:2.5566,x:-872.4158,y:1080.7446},0).wait(1).to({scaleX:2.5684,scaleY:2.5684,x:-889.8423,y:1079.0634},0).wait(175).to({regX:0.1,regY:0.2,scaleX:1.6535,scaleY:1.6535,x:-1328.65,y:483.2,visible:true},0).wait(125).to({regX:0,regY:0,scaleX:1.9933,scaleY:1.9933,x:-225.6,y:1146.45},0).wait(2).to({regX:-0.2,x:-226,y:1146.6},0).wait(1).to({regX:0,scaleX:1.9221,scaleY:1.9221,x:-290.65,y:1155.0036},0).wait(1).to({scaleX:1.8509,scaleY:1.8509,x:-355.6999,y:1163.4071},0).wait(1).to({scaleX:1.7797,scaleY:1.7797,x:-420.7499,y:1171.8107},0).wait(1).to({scaleX:1.7085,scaleY:1.7085,x:-485.7998,y:1180.2143},0).wait(1).to({scaleX:1.6373,scaleY:1.6373,x:-550.8498,y:1188.6179},0).wait(1).to({scaleX:1.5661,scaleY:1.5661,x:-615.8997,y:1197.0214},0).wait(1).to({scaleX:1.4949,scaleY:1.4949,x:-680.9497,y:1205.425},0).wait(1).to({scaleX:1.4237,scaleY:1.4237,x:-745.9996,y:1213.8286},0).wait(1).to({scaleX:1.3525,scaleY:1.3525,x:-811.0496,y:1222.2321},0).wait(1).to({scaleX:1.2813,scaleY:1.2813,x:-876.0995,y:1230.6357},0).wait(1).to({scaleX:1.2101,scaleY:1.2101,x:-941.1495,y:1239.0393},0).wait(1).to({scaleX:1.139,scaleY:1.139,x:-1006.1994,y:1247.4429},0).wait(1).to({scaleX:1.0678,scaleY:1.0678,x:-1071.2494,y:1255.8464},0).wait(1).to({scaleX:0.9966,scaleY:0.9966,x:-1136.2993,y:1264.25},0).wait(89).to({scaleX:1.0546,scaleY:1.0546,x:-1087.027,y:1270.1036},0).wait(1).to({scaleX:1.1126,scaleY:1.1126,x:-1037.7547,y:1275.9571},0).wait(1).to({scaleX:1.1706,scaleY:1.1706,x:-988.4824,y:1281.8107},0).wait(1).to({scaleX:1.2286,scaleY:1.2286,x:-939.2101,y:1287.6643},0).wait(1).to({scaleX:1.2866,scaleY:1.2866,x:-889.9378,y:1293.5179},0).wait(1).to({scaleX:1.3446,scaleY:1.3446,x:-840.6654,y:1299.3714},0).wait(1).to({scaleX:1.4026,scaleY:1.4026,x:-791.3931,y:1305.225},0).wait(1).to({scaleX:1.4606,scaleY:1.4606,x:-742.1208,y:1311.0786},0).wait(1).to({scaleX:1.5186,scaleY:1.5186,x:-692.8485,y:1316.9321},0).wait(1).to({scaleX:1.5766,scaleY:1.5766,x:-643.5762,y:1322.7857},0).wait(1).to({scaleX:1.6346,scaleY:1.6346,x:-594.3039,y:1328.6393},0).wait(1).to({scaleX:1.6926,scaleY:1.6926,x:-545.0316,y:1334.4929},0).wait(1).to({scaleX:1.7506,scaleY:1.7506,x:-495.7592,y:1340.3464},0).wait(1).to({scaleX:1.8086,scaleY:1.8086,x:-446.4869,y:1346.2},0).wait(197).to({_off:true},1).wait(1));

	// buttoms_obj_
	this.buttoms = new lib.Scene_1_buttoms();
	this.buttoms.name = "buttoms";
	this.buttoms.setTransform(1184.55,1037.95,0.3437,0.3437,0,0,0,2718.8,2935.7);
	this.buttoms.depth = 0;
	this.buttoms.isAttachedToCamera = 0
	this.buttoms.isAttachedToMask = 0
	this.buttoms.layerDepth = 0
	this.buttoms.layerIndex = 0
	this.buttoms.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.buttoms).wait(1339).to({regX:1184.5,regY:1038,scaleX:1,scaleY:1,x:1184.5,y:1038},0).wait(1));

	// sun2_obj_
	this.sun2 = new lib.Scene_1_sun2();
	this.sun2.name = "sun2";
	this.sun2.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.sun2.depth = 0;
	this.sun2.isAttachedToCamera = 0
	this.sun2.isAttachedToMask = 0
	this.sun2.layerDepth = 0
	this.sun2.layerIndex = 1
	this.sun2.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.sun2).wait(353).to({regX:431.8,regY:838.1,scaleX:0.6224,scaleY:0.6224,y:-0.05},0).wait(546).to({regX:-2387.1,regY:-112.4,scaleX:0.6048,scaleY:0.6048,y:0},0).wait(125).to({regX:-1501.2,regY:428.8,scaleX:0.5017,scaleY:0.5017,x:0.05},0).to({_off:true},315).wait(1));

	// bubbles1_obj_
	this.bubbles1 = new lib.Scene_1_bubbles1();
	this.bubbles1.name = "bubbles1";
	this.bubbles1.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.bubbles1.depth = 0;
	this.bubbles1.isAttachedToCamera = 0
	this.bubbles1.isAttachedToMask = 0
	this.bubbles1.layerDepth = 0
	this.bubbles1.layerIndex = 2
	this.bubbles1.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.bubbles1).wait(899).to({regX:-2387.1,regY:-112.4,scaleX:0.6048,scaleY:0.6048},0).wait(125).to({regX:-1501.2,regY:428.8,scaleX:0.5017,scaleY:0.5017,x:0.05},0).to({_off:true},315).wait(1));

	// charly_obj_
	this.charly = new lib.Scene_1_charly();
	this.charly.name = "charly";
	this.charly.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.charly.depth = 0;
	this.charly.isAttachedToCamera = 0
	this.charly.isAttachedToMask = 0
	this.charly.layerDepth = 0
	this.charly.layerIndex = 3
	this.charly.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.charly).wait(1024).to({regX:-1501.2,regY:428.8,scaleX:0.5017,scaleY:0.5017,x:0.05},0).wait(119).to({regX:-1604,regY:695.1,scaleX:0.5529,scaleY:0.5529,x:0,y:-0.05},0).wait(89).to({_off:true},107).wait(1));

	// fish2_obj_
	this.fish2 = new lib.Scene_1_fish2();
	this.fish2.name = "fish2";
	this.fish2.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.fish2.depth = 0;
	this.fish2.isAttachedToCamera = 0
	this.fish2.isAttachedToMask = 0
	this.fish2.layerDepth = 0
	this.fish2.layerIndex = 4
	this.fish2.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.fish2).wait(1024).to({regX:-1501.2,regY:428.8,scaleX:0.5017,scaleY:0.5017,x:0.05},0).wait(17).to({regX:-1774,regY:905.5,scaleX:1.0035,scaleY:1.0035,y:0.05},0).wait(68).to({_off:true},230).wait(1));

	// moshe_obj_
	this.moshe = new lib.Scene_1_moshe();
	this.moshe.name = "moshe";
	this.moshe.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.moshe.depth = 0;
	this.moshe.isAttachedToCamera = 0
	this.moshe.isAttachedToMask = 0
	this.moshe.layerDepth = 0
	this.moshe.layerIndex = 5
	this.moshe.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.moshe).wait(1024).to({regX:-1501.2,regY:428.8,scaleX:0.5017,scaleY:0.5017,x:0.05},0).wait(105).to({regX:-1749.7,regY:875.5,scaleX:0.8989,scaleY:0.8989,x:0,y:0.05},0).wait(102).to({regX:-1604,regY:695.1,scaleX:0.5529,scaleY:0.5529,y:-0.05},0).to({_off:true},108).wait(1));

	// trears_6_obj_
	this.trears_6 = new lib.Scene_1_trears_6();
	this.trears_6.name = "trears_6";
	this.trears_6.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.trears_6.depth = 0;
	this.trears_6.isAttachedToCamera = 0
	this.trears_6.isAttachedToMask = 0
	this.trears_6.layerDepth = 0
	this.trears_6.layerIndex = 6
	this.trears_6.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.trears_6).wait(904).to({regX:-2387.1,regY:-112.4,scaleX:0.6048,scaleY:0.6048},0).wait(1).to({regX:-1833,regY:249.1,scaleX:1,scaleY:1,x:554.05,y:361.45},0).wait(118).to({_off:true},1).wait(316));

	// trears_5_obj_
	this.trears_5 = new lib.Scene_1_trears_5();
	this.trears_5.name = "trears_5";
	this.trears_5.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.trears_5.depth = 0;
	this.trears_5.isAttachedToCamera = 0
	this.trears_5.isAttachedToMask = 0
	this.trears_5.layerDepth = 0
	this.trears_5.layerIndex = 7
	this.trears_5.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.trears_5).wait(908).to({regX:-2387.1,regY:-112.4,scaleX:0.6048,scaleY:0.6048},0).wait(1).to({regX:-954.9,regY:237.5,scaleX:1,scaleY:1,x:1432.15,y:349.85},0).wait(114).to({_off:true},1).wait(316));

	// trears_4_obj_
	this.trears_4 = new lib.Scene_1_trears_4();
	this.trears_4.name = "trears_4";
	this.trears_4.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.trears_4.depth = 0;
	this.trears_4.isAttachedToCamera = 0
	this.trears_4.isAttachedToMask = 0
	this.trears_4.layerDepth = 0
	this.trears_4.layerIndex = 8
	this.trears_4.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.trears_4).wait(902).to({regX:-2387.1,regY:-112.4,scaleX:0.6048,scaleY:0.6048},0).wait(17).to({regX:-1000.1,regY:276.5,scaleX:1,scaleY:1,x:1386.95,y:388.85},0).wait(104).to({_off:true},1).wait(316));

	// trears_3_obj_
	this.trears_3 = new lib.Scene_1_trears_3();
	this.trears_3.name = "trears_3";
	this.trears_3.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.trears_3.depth = 0;
	this.trears_3.isAttachedToCamera = 0
	this.trears_3.isAttachedToMask = 0
	this.trears_3.layerDepth = 0
	this.trears_3.layerIndex = 9
	this.trears_3.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.trears_3).wait(902).to({regX:-2387.1,regY:-112.4,scaleX:0.6048,scaleY:0.6048},0).wait(1).to({regX:-1746.4,regY:305.6,scaleX:1,scaleY:1,x:640.65,y:417.95},0).wait(120).to({_off:true},1).wait(316));

	// trears_2_obj_
	this.trears_2 = new lib.Scene_1_trears_2();
	this.trears_2.name = "trears_2";
	this.trears_2.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.trears_2.depth = 0;
	this.trears_2.isAttachedToCamera = 0
	this.trears_2.isAttachedToMask = 0
	this.trears_2.layerDepth = 0
	this.trears_2.layerIndex = 10
	this.trears_2.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.trears_2).wait(913).to({regX:-2387.1,regY:-112.4,scaleX:0.6048,scaleY:0.6048},0).wait(1).to({regX:-1802.9,regY:289.4,scaleX:1,scaleY:1,x:584.15,y:401.75},0).wait(109).to({_off:true},1).wait(316));

	// trears_1_obj_
	this.trears_1 = new lib.Scene_1_trears_1();
	this.trears_1.name = "trears_1";
	this.trears_1.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.trears_1.depth = 0;
	this.trears_1.isAttachedToCamera = 0
	this.trears_1.isAttachedToMask = 0
	this.trears_1.layerDepth = 0
	this.trears_1.layerIndex = 11
	this.trears_1.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.trears_1).wait(902).to({regX:-2387.1,regY:-112.4,scaleX:0.6048,scaleY:0.6048},0).wait(1).to({regX:-1043.9,regY:293.4,scaleX:1,scaleY:1,x:1343.15,y:405.75},0).wait(120).to({_off:true},1).wait(316));

	// moshe_cry_obj_
	this.moshe_cry = new lib.Scene_1_moshe_cry();
	this.moshe_cry.name = "moshe_cry";
	this.moshe_cry.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.moshe_cry.depth = 0;
	this.moshe_cry.isAttachedToCamera = 0
	this.moshe_cry.isAttachedToMask = 0
	this.moshe_cry.layerDepth = 0
	this.moshe_cry.layerIndex = 12
	this.moshe_cry.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.moshe_cry).wait(899).to({regX:-2387.1,regY:-112.4,scaleX:0.6048,scaleY:0.6048},0).to({_off:true},125).wait(316));

	// fish2_entrance_obj_
	this.fish2_entrance = new lib.Scene_1_fish2_entrance();
	this.fish2_entrance.name = "fish2_entrance";
	this.fish2_entrance.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.fish2_entrance.depth = 0;
	this.fish2_entrance.isAttachedToCamera = 0
	this.fish2_entrance.isAttachedToMask = 0
	this.fish2_entrance.layerDepth = 0
	this.fish2_entrance.layerIndex = 13
	this.fish2_entrance.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.fish2_entrance).wait(636).to({regX:-357,regY:672.1,scaleX:0.6508,scaleY:0.6508,y:-0.05},0).wait(170).to({regX:-2533.7,regY:154.3,scaleX:0.3893,scaleY:0.3893},0).to({_off:true},93).wait(441));

	// moshe_entrance2_obj_
	this.moshe_entrance2 = new lib.Scene_1_moshe_entrance2();
	this.moshe_entrance2.name = "moshe_entrance2";
	this.moshe_entrance2.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.moshe_entrance2.depth = 0;
	this.moshe_entrance2.isAttachedToCamera = 0
	this.moshe_entrance2.isAttachedToMask = 0
	this.moshe_entrance2.layerDepth = 0
	this.moshe_entrance2.layerIndex = 14
	this.moshe_entrance2.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.moshe_entrance2).wait(564).to({regX:2093.2,regY:1402.8,scaleX:1.416,scaleY:1.416,x:0.05},0).wait(1).to({regX:820.5,regY:1234.4,scaleX:1,scaleY:1,x:-1272.65,y:-168.35},0).wait(138).to({regX:-2033.2,regY:273.4,scaleX:0.429,scaleY:0.429,x:0,y:0.05},0).wait(100).to({regX:-2533.7,regY:154.3,scaleX:0.3893,scaleY:0.3893,y:-0.05},0).to({_off:true},92).wait(445));

	// moshe_happy_obj_
	this.moshe_happy = new lib.Scene_1_moshe_happy();
	this.moshe_happy.name = "moshe_happy";
	this.moshe_happy.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.moshe_happy.depth = 0;
	this.moshe_happy.isAttachedToCamera = 0
	this.moshe_happy.isAttachedToMask = 0
	this.moshe_happy.layerDepth = 0
	this.moshe_happy.layerIndex = 15
	this.moshe_happy.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.moshe_happy).wait(368).to({regX:431.8,regY:838.1,scaleX:0.6224,scaleY:0.6224,x:0.05},0).wait(22).to({regX:1354.8,regY:1058.3,scaleX:1.2859,scaleY:1.2859,y:-0.1},0).wait(5).to({regX:1113,regY:992.4,scaleX:0.8014,scaleY:0.8014,y:0.05},0).wait(115).to({regX:1016.2,regY:966,scaleX:0.6965,scaleY:0.6965,x:-0.05,y:0},0).to({_off:true},34).wait(796));

	// charly_talk_obj_
	this.charly_talk = new lib.Scene_1_charly_talk();
	this.charly_talk.name = "charly_talk";
	this.charly_talk.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.charly_talk.depth = 0;
	this.charly_talk.isAttachedToCamera = 0
	this.charly_talk.isAttachedToMask = 0
	this.charly_talk.layerDepth = 0
	this.charly_talk.layerIndex = 16
	this.charly_talk.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.charly_talk).wait(316).to({regX:431.8,regY:838.1,scaleX:0.6224,scaleY:0.6224,y:-0.05},0).to({_off:true},52).wait(972));

	// moshe_talk_obj_
	this.moshe_talk = new lib.Scene_1_moshe_talk();
	this.moshe_talk.name = "moshe_talk";
	this.moshe_talk.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.moshe_talk.depth = 0;
	this.moshe_talk.isAttachedToCamera = 0
	this.moshe_talk.isAttachedToMask = 0
	this.moshe_talk.layerDepth = 0
	this.moshe_talk.layerIndex = 17
	this.moshe_talk.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.moshe_talk).wait(86).to({regX:431.8,regY:838.1,scaleX:0.6224,scaleY:0.6224,y:-0.05},0).wait(227).to({_off:true},3).wait(1024));

	// moshe_entrance_obj_
	this.moshe_entrance = new lib.Scene_1_moshe_entrance();
	this.moshe_entrance.name = "moshe_entrance";
	this.moshe_entrance.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.moshe_entrance.depth = 0;
	this.moshe_entrance.isAttachedToCamera = 0
	this.moshe_entrance.isAttachedToMask = 0
	this.moshe_entrance.layerDepth = 0
	this.moshe_entrance.layerIndex = 18
	this.moshe_entrance.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.moshe_entrance).wait(1).to({_off:true},85).wait(1254));

	// background_cry_obj_
	this.background_cry = new lib.Scene_1_background_cry();
	this.background_cry.name = "background_cry";
	this.background_cry.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.background_cry.depth = 0;
	this.background_cry.isAttachedToCamera = 0
	this.background_cry.isAttachedToMask = 0
	this.background_cry.layerDepth = 0
	this.background_cry.layerIndex = 19
	this.background_cry.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.background_cry).wait(899).to({regX:-2387.1,regY:-112.4,scaleX:0.6048,scaleY:0.6048},0).to({_off:true},117).wait(324));

	// background4_obj_
	this.background4 = new lib.Scene_1_background4();
	this.background4.name = "background4";
	this.background4.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.background4.depth = 0;
	this.background4.isAttachedToCamera = 0
	this.background4.isAttachedToMask = 0
	this.background4.layerDepth = 0
	this.background4.layerIndex = 20
	this.background4.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.background4).wait(899).to({regX:-2387.1,regY:-112.4,scaleX:0.6048,scaleY:0.6048},0).wait(117).to({_off:true},323).wait(1));

	// charly_entrance_obj_
	this.charly_entrance = new lib.Scene_1_charly_entrance();
	this.charly_entrance.name = "charly_entrance";
	this.charly_entrance.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.charly_entrance.depth = 0;
	this.charly_entrance.isAttachedToCamera = 0
	this.charly_entrance.isAttachedToMask = 0
	this.charly_entrance.layerDepth = 0
	this.charly_entrance.layerIndex = 21
	this.charly_entrance.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.charly_entrance).wait(517).to({regX:1161.2,regY:1013.9,scaleX:0.7471,scaleY:0.7471},0).wait(1).to({regX:1823.4,regY:1643.2,scaleX:1,scaleY:1,x:662.25,y:629.35},0).wait(46).to({regX:2093.2,regY:1402.8,scaleX:1.416,scaleY:1.416,x:0.05,y:0},0).wait(30).to({regX:693.6,regY:922.1,scaleX:0.9631,scaleY:0.9631},0).wait(1).to({regX:1823.4,regY:1643.2,scaleX:1,scaleY:1,x:1129.85,y:721.15},0).wait(99).to({regX:-1808,regY:327,scaleX:0.4496,scaleY:0.4496,x:0.05,y:0},0).to({_off:true},205).wait(441));

	// small_fish_obj_
	this.small_fish = new lib.Scene_1_small_fish();
	this.small_fish.name = "small_fish";
	this.small_fish.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.small_fish.depth = 0;
	this.small_fish.isAttachedToCamera = 0
	this.small_fish.isAttachedToMask = 0
	this.small_fish.layerDepth = 0
	this.small_fish.layerIndex = 22
	this.small_fish.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.small_fish).wait(619).to({regX:68.2,regY:773.4,scaleX:0.7491,scaleY:0.7491,x:0.05,y:0.05},0).wait(1).to({regX:349.4,regY:925.9,scaleX:1,scaleY:1,x:281.3,y:152.6},0).wait(97).to({regX:-2383.5,regY:190.1,scaleX:0.4004,scaleY:0.4004,x:0.05,y:0},0).to({_off:true},538).wait(85));

	// backgroud2_obj_
	this.backgroud2 = new lib.Scene_1_backgroud2();
	this.backgroud2.name = "backgroud2";
	this.backgroud2.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.backgroud2.depth = 0;
	this.backgroud2.isAttachedToCamera = 0
	this.backgroud2.isAttachedToMask = 0
	this.backgroud2.layerDepth = 0
	this.backgroud2.layerIndex = 23
	this.backgroud2.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.backgroud2).wait(899).to({regX:-2387.1,regY:-112.4,scaleX:0.6048,scaleY:0.6048},0).wait(117).to({_off:true},323).wait(1));

	// background3_obj_
	this.background3 = new lib.Scene_1_background3();
	this.background3.name = "background3";
	this.background3.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.background3.depth = 0;
	this.background3.isAttachedToCamera = 0
	this.background3.isAttachedToMask = 0
	this.background3.layerDepth = 0
	this.background3.layerIndex = 24
	this.background3.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.background3).wait(899).to({regX:-2387.1,regY:-112.4,scaleX:0.6048,scaleY:0.6048},0).wait(117).to({_off:true},323).wait(1));

	// background1_obj_
	this.background1 = new lib.Scene_1_background1();
	this.background1.name = "background1";
	this.background1.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.background1.depth = 0;
	this.background1.isAttachedToCamera = 0
	this.background1.isAttachedToMask = 0
	this.background1.layerDepth = 0
	this.background1.layerIndex = 25
	this.background1.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.background1).wait(899).to({regX:-2387.1,regY:-112.4,scaleX:0.6048,scaleY:0.6048},0).wait(117).to({_off:true},323).wait(1));

	// sun1_obj_
	this.sun1 = new lib.Scene_1_sun1();
	this.sun1.name = "sun1";
	this.sun1.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.sun1.depth = 0;
	this.sun1.isAttachedToCamera = 0
	this.sun1.isAttachedToMask = 0
	this.sun1.layerDepth = 0
	this.sun1.layerIndex = 26
	this.sun1.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.sun1).wait(899).to({regX:-2387.1,regY:-112.4,scaleX:0.6048,scaleY:0.6048},0).wait(117).to({_off:true},323).wait(1));

	// background0_obj_
	this.background0 = new lib.Scene_1_background0();
	this.background0.name = "background0";
	this.background0.setTransform(0,0,0.3437,0.3437,0,0,0,-727.9,-84.5);
	this.background0.depth = 0;
	this.background0.isAttachedToCamera = 0
	this.background0.isAttachedToMask = 0
	this.background0.layerDepth = 0
	this.background0.layerIndex = 27
	this.background0.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.background0).wait(899).to({regX:-2387.1,regY:-112.4,scaleX:0.6048,scaleY:0.6048},0).wait(117).to({_off:true},323).wait(1));

	this._renderFirstFrame();

}).prototype = p = new lib.AnMovieClip();
p.nominalBounds = new cjs.Rectangle(-2170.9,-2816.1,5574,9626.9);
// library properties:
lib.properties = {
	id: '043E0BA2D8138647AAEBD1DF3D87CB60',
	width: 1280,
	height: 720,
	fps: 30,
	color: "#FFFFFF",
	opacity: 1.00,
	webfonts: {},
	manifest: [
		{src:"sounds/bubble.mp3?1618823455399", id:"bubble"},
		{src:"sounds/charlicall.mp3?1618823455399", id:"charlicall"},
		{src:"sounds/charly.mp3?1618823455399", id:"charly"},
		{src:"sounds/fish1.mp3?1618823455399", id:"fish1"},
		{src:"sounds/fish2.mp3?1618823455399", id:"fish2"},
		{src:"sounds/moshe1.mp3?1618823455399", id:"moshe1"},
		{src:"sounds/moshe2.mp3?1618823455399", id:"moshe2"},
		{src:"sounds/moshe3.mp3?1618823455399", id:"moshe3"},
		{src:"sounds/SadSoundBiblecom759843766.mp3?1618823455399", id:"SadSoundBiblecom759843766"},
		{src:"sounds/Sad_TromboneJoe_Lamb665429450.mp3?1618823455399", id:"Sad_TromboneJoe_Lamb665429450"}
	],
	preloads: []
};



// bootstrap callback support:

(lib.Stage = function(canvas) {
	createjs.Stage.call(this, canvas);
}).prototype = p = new createjs.Stage();

p.setAutoPlay = function(autoPlay) {
	this.tickEnabled = autoPlay;
}
p.play = function() { this.tickEnabled = true; this.getChildAt(0).gotoAndPlay(this.getTimelinePosition()) }
p.stop = function(ms) { if(ms) this.seek(ms); this.tickEnabled = false; }
p.seek = function(ms) { this.tickEnabled = true; this.getChildAt(0).gotoAndStop(lib.properties.fps * ms / 1000); }
p.getDuration = function() { return this.getChildAt(0).totalFrames / lib.properties.fps * 1000; }

p.getTimelinePosition = function() { return this.getChildAt(0).currentFrame / lib.properties.fps * 1000; }

an.bootcompsLoaded = an.bootcompsLoaded || [];
if(!an.bootstrapListeners) {
	an.bootstrapListeners=[];
}

an.bootstrapCallback=function(fnCallback) {
	an.bootstrapListeners.push(fnCallback);
	if(an.bootcompsLoaded.length > 0) {
		for(var i=0; i<an.bootcompsLoaded.length; ++i) {
			fnCallback(an.bootcompsLoaded[i]);
		}
	}
};

an.compositions = an.compositions || {};
an.compositions['043E0BA2D8138647AAEBD1DF3D87CB60'] = {
	getStage: function() { return exportRoot.stage; },
	getLibrary: function() { return lib; },
	getSpriteSheet: function() { return ss; },
	getImages: function() { return img; }
};

an.compositionLoaded = function(id) {
	an.bootcompsLoaded.push(id);
	for(var j=0; j<an.bootstrapListeners.length; j++) {
		an.bootstrapListeners[j](id);
	}
}

an.getComposition = function(id) {
	return an.compositions[id];
}

p._getProjectionMatrix = function(container, totalDepth) {	var focalLength = 528.25;
	var projectionCenter = { x : lib.properties.width/2, y : lib.properties.height/2 };
	var scale = (totalDepth + focalLength)/focalLength;
	var scaleMat = new createjs.Matrix2D;
	scaleMat.a = 1/scale;
	scaleMat.d = 1/scale;
	var projMat = new createjs.Matrix2D;
	projMat.tx = -projectionCenter.x;
	projMat.ty = -projectionCenter.y;
	projMat = projMat.prependMatrix(scaleMat);
	projMat.tx += projectionCenter.x;
	projMat.ty += projectionCenter.y;
	return projMat;
}
p._handleTick = function(event) {
	var cameraInstance = exportRoot.___camera___instance;
	if(cameraInstance !== undefined && cameraInstance.pinToObject !== undefined)
	{
		cameraInstance.x = cameraInstance.pinToObject.x + cameraInstance.pinToObject.pinOffsetX;
		cameraInstance.y = cameraInstance.pinToObject.y + cameraInstance.pinToObject.pinOffsetY;
		if(cameraInstance.pinToObject.parent !== undefined && cameraInstance.pinToObject.parent.depth !== undefined)
		cameraInstance.depth = cameraInstance.pinToObject.parent.depth + cameraInstance.pinToObject.pinOffsetZ;
	}
	stage._applyLayerZDepth(exportRoot);
}
p._applyLayerZDepth = function(parent)
{
	var cameraInstance = parent.___camera___instance;
	var focalLength = 528.25;
	var projectionCenter = { 'x' : 0, 'y' : 0};
	if(parent === exportRoot)
	{
		var stageCenter = { 'x' : lib.properties.width/2, 'y' : lib.properties.height/2 };
		projectionCenter.x = stageCenter.x;
		projectionCenter.y = stageCenter.y;
	}
	for(child in parent.children)
	{
		var layerObj = parent.children[child];
		if(layerObj == cameraInstance)
			continue;
		stage._applyLayerZDepth(layerObj, cameraInstance);
		if(layerObj.layerDepth === undefined)
			continue;
		if(layerObj.currentFrame != layerObj.parent.currentFrame)
		{
			layerObj.gotoAndPlay(layerObj.parent.currentFrame);
		}
		var matToApply = new createjs.Matrix2D;
		var cameraMat = new createjs.Matrix2D;
		var totalDepth = layerObj.layerDepth ? layerObj.layerDepth : 0;
		var cameraDepth = 0;
		if(cameraInstance && !layerObj.isAttachedToCamera)
		{
			var mat = cameraInstance.getMatrix();
			mat.tx -= projectionCenter.x;
			mat.ty -= projectionCenter.y;
			cameraMat = mat.invert();
			cameraMat.prependTransform(projectionCenter.x, projectionCenter.y, 1, 1, 0, 0, 0, 0, 0);
			cameraMat.appendTransform(-projectionCenter.x, -projectionCenter.y, 1, 1, 0, 0, 0, 0, 0);
			if(cameraInstance.depth)
				cameraDepth = cameraInstance.depth;
		}
		if(layerObj.depth)
		{
			totalDepth = layerObj.depth;
		}
		//Offset by camera depth
		totalDepth -= cameraDepth;
		if(totalDepth < -focalLength)
		{
			matToApply.a = 0;
			matToApply.d = 0;
		}
		else
		{
			if(layerObj.layerDepth)
			{
				var sizeLockedMat = stage._getProjectionMatrix(parent, layerObj.layerDepth);
				if(sizeLockedMat)
				{
					sizeLockedMat.invert();
					matToApply.prependMatrix(sizeLockedMat);
				}
			}
			matToApply.prependMatrix(cameraMat);
			var projMat = stage._getProjectionMatrix(parent, totalDepth);
			if(projMat)
			{
				matToApply.prependMatrix(projMat);
			}
		}
		layerObj.transformMatrix = matToApply;
	}
}
an.makeResponsive = function(isResp, respDim, isScale, scaleType, domContainers) {		
	var lastW, lastH, lastS=1;		
	window.addEventListener('resize', resizeCanvas);		
	resizeCanvas();		
	function resizeCanvas() {			
		var w = lib.properties.width, h = lib.properties.height;			
		var iw = window.innerWidth, ih=window.innerHeight;			
		var pRatio = window.devicePixelRatio || 1, xRatio=iw/w, yRatio=ih/h, sRatio=1;			
		if(isResp) {                
			if((respDim=='width'&&lastW==iw) || (respDim=='height'&&lastH==ih)) {                    
				sRatio = lastS;                
			}				
			else if(!isScale) {					
				if(iw<w || ih<h)						
					sRatio = Math.min(xRatio, yRatio);				
			}				
			else if(scaleType==1) {					
				sRatio = Math.min(xRatio, yRatio);				
			}				
			else if(scaleType==2) {					
				sRatio = Math.max(xRatio, yRatio);				
			}			
		}
		domContainers[0].width = w * pRatio * sRatio;			
		domContainers[0].height = h * pRatio * sRatio;
		domContainers.forEach(function(container) {				
			container.style.width = w * sRatio + 'px';				
			container.style.height = h * sRatio + 'px';			
		});
		stage.scaleX = pRatio*sRatio;			
		stage.scaleY = pRatio*sRatio;
		lastW = iw; lastH = ih; lastS = sRatio;            
		stage.tickOnUpdate = false;            
		stage.update();            
		stage.tickOnUpdate = true;		
	}
}

// Virtual camera API : 

an.VirtualCamera = new function() {
var _camera = new Object();
function VC(timeline) {
	this.timeline = timeline;
	this.camera = timeline.___camera___instance;
	this.centerX = lib.properties.width / 2;
	this.centerY = lib.properties.height / 2;
	this.camAxisX = this.camera.x;
	this.camAxisY = this.camera.y;
	if(timeline.___camera___instance == null || timeline.___camera___instance == undefined ) {
		timeline.___camera___instance = new cjs.MovieClip();
		timeline.___camera___instance.visible = false;
		timeline.___camera___instance.parent = timeline;
		timeline.___camera___instance.setTransform(this.centerX, this.centerY);
	}
	this.camera = timeline.___camera___instance;
}

VC.prototype.moveBy = function(x, y, z) {
z = typeof z !== 'undefined' ? z : 0;
	var position = this.___getCamPosition___();
	var rotAngle = this.getRotation()*Math.PI/180;
	var sinTheta = Math.sin(rotAngle);
	var cosTheta = Math.cos(rotAngle);
	var offX= x*cosTheta + y*sinTheta;
	var offY = y*cosTheta - x*sinTheta;
	this.camAxisX = this.camAxisX - x;
	this.camAxisY = this.camAxisY - y;
	var posX = position.x + offX;
	var posY = position.y + offY;
	this.camera.x = this.centerX - posX;
	this.camera.y = this.centerY - posY;
	this.camera.depth += z;
};

VC.prototype.setPosition = function(x, y, z) {
	z = typeof z !== 'undefined' ? z : 0;

	const MAX_X = 10000;
	const MIN_X = -10000;
	const MAX_Y = 10000;
	const MIN_Y = -10000;
	const MAX_Z = 10000;
	const MIN_Z = -5000;

	if(x > MAX_X)
	  x = MAX_X;
	else if(x < MIN_X)
	  x = MIN_X;
	if(y > MAX_Y)
	  y = MAX_Y;
	else if(y < MIN_Y)
	  y = MIN_Y;
	if(z > MAX_Z)
	  z = MAX_Z;
	else if(z < MIN_Z)
	  z = MIN_Z;

	var rotAngle = this.getRotation()*Math.PI/180;
	var sinTheta = Math.sin(rotAngle);
	var cosTheta = Math.cos(rotAngle);
	var offX= x*cosTheta + y*sinTheta;
	var offY = y*cosTheta - x*sinTheta;
	
	this.camAxisX = this.centerX - x;
	this.camAxisY = this.centerY - y;
	this.camera.x = this.centerX - offX;
	this.camera.y = this.centerY - offY;
	this.camera.depth = z;
};

VC.prototype.getPosition = function() {
	var loc = new Object();
	loc['x'] = this.centerX - this.camAxisX;
	loc['y'] = this.centerY - this.camAxisY;
	loc['z'] = this.camera.depth;
	return loc;
};

VC.prototype.resetPosition = function() {
	this.setPosition(0, 0);
};

VC.prototype.zoomBy = function(zoom) {
	this.setZoom( (this.getZoom() * zoom) / 100);
};

VC.prototype.setZoom = function(zoom) {
	const MAX_zoom = 10000;
	const MIN_zoom = 1;
	if(zoom > MAX_zoom)
	zoom = MAX_zoom;
	else if(zoom < MIN_zoom)
	zoom = MIN_zoom;
	this.camera.scaleX = 100 / zoom;
	this.camera.scaleY = 100 / zoom;
};

VC.prototype.getZoom = function() {
	return 100 / this.camera.scaleX;
};

VC.prototype.resetZoom = function() {
	this.setZoom(100);
};

VC.prototype.rotateBy = function(angle) {
	this.setRotation( this.getRotation() + angle );
};

VC.prototype.setRotation = function(angle) {
	const MAX_angle = 180;
	const MIN_angle = -179;
	if(angle > MAX_angle)
		angle = MAX_angle;
	else if(angle < MIN_angle)
		angle = MIN_angle;
	this.camera.rotation = -angle;
};

VC.prototype.getRotation = function() {
	return -this.camera.rotation;
};

VC.prototype.resetRotation = function() {
	this.setRotation(0);
};

VC.prototype.reset = function() {
	this.resetPosition();
	this.resetZoom();
	this.resetRotation();
	this.unpinCamera();
};
VC.prototype.setZDepth = function(zDepth) {
	const MAX_zDepth = 10000;
	const MIN_zDepth = -5000;
	if(zDepth > MAX_zDepth)
		zDepth = MAX_zDepth;
	else if(zDepth < MIN_zDepth)
		zDepth = MIN_zDepth;
	this.camera.depth = zDepth;
}
VC.prototype.getZDepth = function() {
	return this.camera.depth;
}
VC.prototype.resetZDepth = function() {
	this.camera.depth = 0;
}

VC.prototype.pinCameraToObject = function(obj, offsetX, offsetY, offsetZ) {

	offsetX = typeof offsetX !== 'undefined' ? offsetX : 0;

	offsetY = typeof offsetY !== 'undefined' ? offsetY : 0;

	offsetZ = typeof offsetZ !== 'undefined' ? offsetZ : 0;
	if(obj === undefined)
		return;
	this.camera.pinToObject = obj;
	this.camera.pinToObject.pinOffsetX = offsetX;
	this.camera.pinToObject.pinOffsetY = offsetY;
	this.camera.pinToObject.pinOffsetZ = offsetZ;
};

VC.prototype.setPinOffset = function(offsetX, offsetY, offsetZ) {
	if(this.camera.pinToObject != undefined) {
	this.camera.pinToObject.pinOffsetX = offsetX;
	this.camera.pinToObject.pinOffsetY = offsetY;
	this.camera.pinToObject.pinOffsetZ = offsetZ;
	}
};

VC.prototype.unpinCamera = function() {
	this.camera.pinToObject = undefined;
};
VC.prototype.___getCamPosition___ = function() {
	var loc = new Object();
	loc['x'] = this.centerX - this.camera.x;
	loc['y'] = this.centerY - this.camera.y;
	loc['z'] = this.depth;
	return loc;
};

this.getCamera = function(timeline) {
	timeline = typeof timeline !== 'undefined' ? timeline : null;
	if(timeline === null) timeline = exportRoot;
	if(_camera[timeline] == undefined)
	_camera[timeline] = new VC(timeline);
	return _camera[timeline];
}

this.getCameraAsMovieClip = function(timeline) {
	timeline = typeof timeline !== 'undefined' ? timeline : null;
	if(timeline === null) timeline = exportRoot;
	return this.getCamera(timeline).camera;
}
}


// Layer depth API : 

an.Layer = new function() {
	this.getLayerZDepth = function(timeline, layerName)
	{
		if(layerName === "Camera")
		layerName = "___camera___instance";
		var script = "if(timeline." + layerName + ") timeline." + layerName + ".depth; else 0;";
		return eval(script);
	}
	this.setLayerZDepth = function(timeline, layerName, zDepth)
	{
		const MAX_zDepth = 10000;
		const MIN_zDepth = -5000;
		if(zDepth > MAX_zDepth)
			zDepth = MAX_zDepth;
		else if(zDepth < MIN_zDepth)
			zDepth = MIN_zDepth;
		if(layerName === "Camera")
		layerName = "___camera___instance";
		var script = "if(timeline." + layerName + ") timeline." + layerName + ".depth = " + zDepth + ";";
		eval(script);
	}
	this.removeLayer = function(timeline, layerName)
	{
		if(layerName === "Camera")
		layerName = "___camera___instance";
		var script = "if(timeline." + layerName + ") timeline.removeChild(timeline." + layerName + ");";
		eval(script);
	}
	this.addNewLayer = function(timeline, layerName, zDepth)
	{
		if(layerName === "Camera")
		layerName = "___camera___instance";
		zDepth = typeof zDepth !== 'undefined' ? zDepth : 0;
		var layer = new createjs.MovieClip();
		layer.name = layerName;
		layer.depth = zDepth;
		layer.layerIndex = 0;
		timeline.addChild(layer);
	}
}
an.handleSoundStreamOnTick = function(event) {
	if(!event.paused){
		var stageChild = stage.getChildAt(0);
		if(!stageChild.paused || stageChild.ignorePause){
			stageChild.syncStreamSounds();
		}
	}
}


})(createjs = createjs||{}, AdobeAn = AdobeAn||{});
var createjs, AdobeAn;