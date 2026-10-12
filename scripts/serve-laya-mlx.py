#!/usr/bin/env python3
"""Dedicated Laya worker; reuse audited loopback transport, not the NanoJev model."""
import argparse
import importlib.util
import json
import os
from pathlib import Path
import secrets
import signal
from laya_mlx_service import LayaEngine, PROFILES
from nanojev_mlx.contract import parse_json

spec=importlib.util.spec_from_file_location('local_http',Path(__file__).with_name('serve-nanojev-mlx.py'))
transport=importlib.util.module_from_spec(spec);spec.loader.exec_module(transport)

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--variant',choices=PROFILES,default='multilingual')
    p.add_argument('--model-dir',type=Path)
    p.add_argument('--port',type=int)
    p.add_argument('--connection-file',type=Path)
    a=p.parse_args();port=a.port or (8770 if a.variant=='multilingual' else 8771)
    if not 1<=port<=65535:p.error('invalid_port')
    conn=a.connection_file or Path.home()/'.cache/study-room/laya-mlx'/('connection-'+a.variant+'.json')
    if conn.is_symlink():raise ValueError('unsafe_connection_file')
    if conn.exists():
        old=parse_json(conn.read_text())
        try:os.kill(int(old['pid']),0)
        except ProcessLookupError:pass
        else:raise RuntimeError('recorded_worker_still_running')
    os.environ['HF_HUB_OFFLINE']='1';os.environ['HF_DATASETS_OFFLINE']='1'
    model_dir=a.model_dir or Path.home()/'.omlx/models'/PROFILES[a.variant]['model']
    engine=LayaEngine(model_dir,a.variant);token=secrets.token_hex(32)
    server=transport.create_server(engine,port,token,backend='study-room-laya-mlx-v1',token_header='X-Local-Model-Token')
    record={'schema':'study-room.laya-connection.v1','host':'127.0.0.1','port':port,'token':token,'pid':os.getpid(),'model':engine.profile['model'],'variant':a.variant,'weights_sha256':engine.profile['sha']}
    transport.write_connection(conn,record)
    print(json.dumps({'event':'ready','url':f'http://127.0.0.1:{port}',**engine.health()}),flush=True)
    def stop(*_):raise KeyboardInterrupt
    signal.signal(signal.SIGTERM,stop)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:
        server.server_close()
        try:
            if parse_json(conn.read_text()).get('pid')==os.getpid():conn.unlink()
        except (OSError,ValueError):pass
if __name__=='__main__':main()
