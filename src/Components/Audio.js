import 'babel-polyfill';
import React, { Component } from 'react';
import ReactPlayer from 'react-player';
import { globalData } from "../globals.js";



export default class Audio extends Component {
	
	render()
	{
		if(this.props.app.state.audioState===null) return null;
		if(this.props.app.state.commentaryAudioMode) return <AudioCommentary app={this.props.app} />
		return <AudioVerse app={this.props.app} />
		
	}
	
}
	

class AudioVerse extends Component {
	
	
	audioPointer=0;
	componentDidUpdate()
	{
		if(this.props.app.state.audioPointer===this.audioPointer) return false;
		this.props.app.setState({audioPointer:this.audioPointer});
	}
	render()
	{
		
		if(globalData.meta.version[this.props.app.state.version].audio!==1 && !this.props.app.state.version.hebrewMode) return null;
		
		//Queue Management
		var version = this.props.app.state.version;
		if(this.props.app.state.hebrewMode) version = "HEBREW";
		var url = "http://mp3.scripture.guide/"+version+"/"+this.props.app.state.active_verse_id;
		var next_url = url;
		var next = null;
		this.audioPointer=this.props.app.state.audioPointer;
		var index = -1;
		while(index===-1 && this.audioPointer>=0)
		{
			 index = this.props.app.state.highlighted_verse_range.indexOf(this.props.app.state.active_verse_id,this.audioPointer);
			 this.audioPointer--;
		}
		 if((index+1)<this.props.app.state.highlighted_verse_range.length)  { 
		 	next = this.props.app.state.highlighted_verse_range[index+1];
		 	next_url =  "http://mp3.scripture.guide/"+version+"/"+next;
		 }
		if(index>=0) this.audioPointer=index;
		
		//Call Backs
		var onStart = ()=>{
			this.props.app.setState({    
			selected_verse:null,    
			audioState:"playing"})
		}
		var onEnded = (next)=>{

		  	if(next===null || 
		  	this.props.app.state.highlighted_verse_range.indexOf(this.props.app.state.active_verse_id)<0 || 
		  	this.props.app.state.highlighted_verse_range.indexOf(next)<0)
		  	{
		  		return this.props.app.setState({  audioState:null },this.props.app.setUrl.bind(this.props.app));
		  	}
		  	else this.props.app.setActiveVerse(next,undefined,undefined,undefined,"audio");
		  	
		}
		
		return [<ReactPlayer className='react-player'
          	width='0%'
          	height='0%'
			key={1}
			url={url}
			playing={true} 
			onStart={onStart}
			onEnded={onEnded.bind(this,next)}
		/>,<ReactPlayer  className='react-player'
          	width='0%'
          	height='0%'
			key={2}
			url={next_url}
			playing={true}
			volume={0}
			muted={true}
		/>]
	}

}


class AudioCommentary extends Component {
	
	
	lookupVerses(verses)
	{
		if(verses===undefined) return false;
		if(verses.length===0)  return false;
		

			this.props.app.setState({
				commentary_audio_verse_range:verses,
				comSearchMode:false},
				this.props.app.setActiveVerse.bind(this.props.app,verses[0],undefined,undefined,undefined,"audio"));

	}
	
	audioPointer=0;
	h_verses=[];
	componentDidUpdate()
	{
		if(this.props.app.state.audioPointer===this.audioPointer) return false;
		var callback = this.lookupVerses.bind(this,this.h_verses)
		this.props.app.setState({audioPointer:this.audioPointer},callback);
	}
	// URL for Commentary http://isaiah.scripture.guide/commentary/gileadi/Isaiah_01.1.mp3
	render()
	{
			var verse_id = this.props.app.state.active_verse_id;
			if(this.props.app.state.commentary_audio_verse_range.length>0) verse_id = this.props.app.state.commentary_audio_verse_range[0];
			
			
			var commentaryAudio = this.props.app.state.commentaryAudio;
			if(globalData.commentary_audio.files[this.props.app.state.commentaryAudio]===undefined) commentaryAudio = "gileadi";
			
			var filename = globalData.commentary_audio.index[verse_id][commentaryAudio];
			var url = "http://scripture.guide/mp3/commentary/"+commentaryAudio+"/"+filename;
			
			var keys = Object.keys(globalData.commentary_audio.files[commentaryAudio]);
			var com_index = keys.indexOf(filename[0]);
			this.audioPointer=com_index;
			var nextfile = keys[com_index+1];
			if(nextfile===undefined) return null;
			var next_url = "http://scripture.guide/mp3/commentary/"+commentaryAudio+"/"+nextfile;
			this.h_verses = globalData.commentary_audio.files[commentaryAudio][filename];
			var nh_verses = globalData.commentary_audio.files[commentaryAudio][nextfile];
			var next = nh_verses[0];
			//set highlight verses
			
			if(this.h_verses===undefined)
			{
				debugger;
				return false;
			}
			
			var onStart = ()=>{
				this.props.app.setState({    
				selected_verse:null,
				commentary_audio_verse_range: this.h_verses,
				audioState:"playing"});
				
				//preload next
			}
		
		
		var onEnded = (next)=>{
			
		  	if(next===null || next===undefined) return this.props.app.setState({  audioState:null,commentary_audio_verse_range:[] });
		  	
		  	this.props.app.setActiveVerse(next,undefined,undefined,undefined,"comaudio");
		}
		
		return [<ReactPlayer className='react-player'
          	width='0%'
          	height='0%'
			key={1}
			url={url}
			playing={true} 
			onStart={onStart}
			onEnded={onEnded.bind(this,next)}
		/>,<ReactPlayer  className='react-player'
          	width='0%'
          	height='0%'
			key={2}
			url={next_url}
			playing={true}
			volume={0}
			muted={true}
		/>]
	}

}

	