"""配置管理路由"""
import os
from fastapi import APIRouter, UploadFile, File, HTTPException

from core.config_service import load_config, update_config
from core.models import ConfigResponse, ConfigUpdateRequest

router = APIRouter(prefix="/api/config", tags=["config"])

COOKIES_DIR = "/app/config/cookies"
os.makedirs(COOKIES_DIR, exist_ok=True)


@router.get("", response_model=ConfigResponse)
async def get_config():
    """获取全局配置"""
    return load_config()


@router.put("", response_model=ConfigResponse)
async def update_config_route(request: ConfigUpdateRequest):
    """更新全局配置"""
    # 只更新非 None 的字段
    partial = {k: v for k, v in request.model_dump().items() if v is not None}
    if partial:
        updated = update_config(partial)
        return updated
    return load_config()


@router.post("/cookies/upload")
async def upload_cookies_file(file: UploadFile = File(...)):
    """上传 cookies 文件"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="文件名不能为空")
    
    if not file.filename.endswith(".txt"):
        raise HTTPException(status_code=400, detail="仅支持 .txt 格式的 cookies 文件")
    
    file_path = os.path.join(COOKIES_DIR, file.filename)
    
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        update_config({"authentication": {"cookies_file": file_path}})
        
        return {"success": True, "message": "Cookies 文件上传成功", "file_path": file_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件保存失败: {str(e)}")


@router.get("/cookies/list")
async def list_cookies_files():
    """列出已上传的 cookies 文件"""
    try:
        files = [f for f in os.listdir(COOKIES_DIR) if f.endswith(".txt")]
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取文件列表失败: {str(e)}")


@router.delete("/cookies/{filename}")
async def delete_cookies_file(filename: str):
    """删除指定的 cookies 文件"""
    if not filename.endswith(".txt"):
        raise HTTPException(status_code=400, detail="仅支持删除 .txt 格式的文件")
    
    file_path = os.path.join(COOKIES_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件不存在")
    
    try:
        os.remove(file_path)
        return {"success": True, "message": "文件删除成功"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件删除失败: {str(e)}")
