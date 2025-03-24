import './newVideo.scss';
import { useState, useContext } from 'react';
import { VideoContext } from '../../contexts/videoContext/VideoContext';
import storage from '../../firebase';
import { createVideo } from '../../contexts/videoContext/apiCalls';

const NewVideo = () => {
    const [video, setVideo] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailSmall, setThumbnailSmall] = useState(null);
    const [trailer, setTrailer] = useState(null);
    const [videoContent, setVideoContent] = useState(null);
    const [uploaded, setUploaded] = useState(0);

    const { dispatch } = useContext(VideoContext);

    const handleChange = (e) => {
	setVideo((prevVideo) => {
	    return { ...prevVideo, [e.target.name]: e.target.value };
	});
    };

    const firebaseUpload = (inputs) => {
	inputs.forEach((input) => {
	    const filename = new Date().getTime() + input.name + input.file.name;

	    const storageRef = storage.ref(`futtech-inputs/${filename}`);
	    const fileToFirebase = storageRef.put(input.file);

	    fileToFirebase.on(
		'state_changed',
		(snapshot) => {
		    const progress = (snapshot.bytesTransferred / snapshot.bytesTotal) * 100;
		    console.log('Upload is ' + Number(progress).toFixed(2) + '% done.');
		},
		(error) => {
		    console.log(error);
		},
		() => {
		    fileToFirebase.snapshot.ref.getDownloadURL()
			.then((url) => {
			    setVideo((prev) => {
				return { ...prev, [input.name]: url }
			    });

			    setUploaded((prevCount) => prevCount + 1);
			});
		}
	    );
	});
    };

    const handleUpload = (e) => {
	e.preventDefault();

	firebaseUpload([
	    { file: thumbnail, name: 'thumbnail' },
	    { file: thumbnailSmall, name: 'thumbnailSmall' },
	    { file: trailer, name: 'trailer' },
	    { file: videoContent, name: 'videoContent' },
	]);
    };

    const handleSubmit = (e) => {
	e.preventDefault();

	createVideo(video, dispatch);
    };

    return (
	<div className='newVideo'>
	    <h1 className='newVideoTitle'>New Video</h1>

	    <form className='newVideoForm'>
		<div className='newVideoTop'>
		    <div className='newVideoItem'>
			<label>Title</label>
			<input type='text'
			       placeholder={ 'video.title' }
			       className='newVideoInput'
			       name='title'
			       onChange={handleChange}
			/>
		    </div>
		    <div className='newVideoItem'>
			<label>Description</label>
			<input type='text'
			       placeholder={ 'video.desc' }
			       className='newVideoInput'
			       name='desc'
			       onChange={handleChange}
			/>
		    </div>
		    <div className='newVideoItem'>
			<label>Location</label>
			<input type='text'
			       placeholder={ 'video.location' }
			       className='newVideoInput'
			       name='location'
			       onChange={handleChange}
			/>
		    </div>
		    <div className='newVideoItem'>
			<label>Category</label>
			<input type='text'
			       placeholder={ 'video.category' }
			       className='newVideoInput'
			       name='category'
			       onChange={handleChange}
			/>
		    </div>
		    <div className='newVideoItem'>
			<label>Drone Footage?</label>
			<select className='newVideoSelect'
				name='isDrone'
				onChange={handleChange}
				id='isDrone'
			>
			    <option>Select</option>
			    <option value='true'>Yes</option>
			    <option value='false'>No</option>
			</select>
		    </div>
		    <div className='newVideoItem'>
			<label>AI Analysis?</label>
			<select className='newVideoSelect'
			       name='isAiAnalysis'
				onChange={handleChange}
				id='isAiAnalysis'
			>
			    <option>Select</option>
			    <option value='true'>Yes</option>
			    <option value='false'>No</option>
			</select>
		    </div>
		    <div className='newVideoItem'>
			<label>Video</label>
			<input type='file'
			       id='video'
			       name='video'
			       onChange={(e) => setVideo(e.target.files[0])}
			/>
		    </div>
		    <div className='newVideoItem'>
			<label>Trailer</label>
			<input type='file'
			       id='trailer'
			       name='trailer'
			       onChange={(e) => setTrailer(e.target.files[0])}
			/>
		    </div>
		    <div className='newVideoItem'>
			<label>Main Thumbnail</label>
			<input type='file'
			       id='thumbnail'
			       name='thumbnail'
			       onChange={(e) => setThumbnail(e.target.files[0])}
			/>
		    </div>
		    <div className='newVideoItem'>
			<label>Smaller Thumbnail</label>
			<input type='file'
			       id='thumbnailSmall'
			       name='thumbnailSmall'
			       onChange={(e) => setThumbnailSmall(e.target.files[0])}
			/>
		    </div>
		</div>
		<div className='newVideoBottom'>
		    {uploaded !== 4 ? (
			<button className='newVideoButton'
				onClick={handleUpload}
			>
			    Upload
			</button>
		    ) : (
			<button className='newVideoButton'
				onClick={handleSubmit}
			>
			    Create
			</button>
		    )}
		</div>
	    </form>

	</div>
    );
};

export default NewVideo;
